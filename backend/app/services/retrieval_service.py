from dataclasses import dataclass
from decimal import Decimal
from typing import Any
from app.schemas.chat import ConversationMessage
from sqlalchemy import text

from app.database import engine
from app.services.embedding_service import (
    create_query_embedding,
    embedding_model,
    serialize_embedding,
)


@dataclass(frozen=True)
class RetrievalResult:
    chunk_id: str
    source_title: str
    source_type: str
    content: str
    metadata: dict[str, Any]
    similarity: float
    product_name: str | None
    product_sku: str | None
    product_price_inr: Decimal | None
    product_weight_grams: int | None
    product_flavour_profile: str | None


def build_retrieval_query(
    message: str,
    conversation_history: list[ConversationMessage],
) -> str:
    cleaned_message = message.strip()

    if not conversation_history:
        return cleaned_message

    recent_history = conversation_history[-6:]

    history_lines = [
        f"{item.role.capitalize()}: {item.content.strip()}"
        for item in recent_history
    ]

    return "\n".join(
        [
            "Use this conversation only to resolve references "
            "in the current search query.",
            *history_lines,
            f"Current customer question: {cleaned_message}",
        ]
    )


def retrieve_knowledge(
    query: str,
    match_count: int = 4,
    match_threshold: float = 0.45,
    semantic_weight: float = 1.0,
    keyword_weight: float = 1.2,
    rrf_k: int = 50,
) -> list[RetrievalResult]:
    cleaned_query = query.strip()

    if not cleaned_query:
        return []

    if match_count <= 0:
        raise ValueError("match_count must be greater than zero.")

    query_embedding = create_query_embedding(cleaned_query)
    serialized_embedding = serialize_embedding(query_embedding)

    candidate_count = max(match_count * 3, 10)

    with engine.connect() as connection:
        rows = connection.execute(
            text(
                """
                with semantic_candidates as (
                    select
                        kc.id,
                        kc.embedding <=> cast(
                            :query_embedding as extensions.vector
                        ) as distance
                    from public.knowledge_chunks kc
                    join public.knowledge_sources ks
                        on ks.id = kc.source_id
                    left join public.products p
                        on p.id = ks.product_id
                    where ks.is_active = true
                      and (
                          p.id is null
                          or p.is_active = true
                      )
                      and kc.embedding_model = :embedding_model
                    order by kc.embedding <=> cast(
                        :query_embedding as extensions.vector
                    )
                    limit :candidate_count
                ),

                semantic_ranked as (
                    select
                        id,
                        1 - distance as similarity,
                        row_number() over (
                            order by distance
                        ) as semantic_rank
                    from semantic_candidates
                    where 1 - distance >= :match_threshold
                ),

                keyword_ranked as (
                    select
                        kc.id,
                        row_number() over (
                            order by ts_rank_cd(
                                kc.fts,
                                websearch_to_tsquery(
                                    'english',
                                    :query_text
                                )
                            ) desc
                        ) as keyword_rank
                    from public.knowledge_chunks kc
                    join public.knowledge_sources ks
                        on ks.id = kc.source_id
                    left join public.products p
                        on p.id = ks.product_id
                    where ks.is_active = true
                      and (
                          p.id is null
                          or p.is_active = true
                      )
                      and kc.fts @@ websearch_to_tsquery(
                          'english',
                          :query_text
                      )
                    order by ts_rank_cd(
                        kc.fts,
                        websearch_to_tsquery(
                            'english',
                            :query_text
                        )
                    ) desc
                    limit :candidate_count
                ),

                combined as (
                    select
                        coalesce(
                            semantic_ranked.id,
                            keyword_ranked.id
                        ) as chunk_id,

                        semantic_ranked.similarity,

                        (
                            coalesce(
                                1.0 / (
                                    :rrf_k
                                    + semantic_ranked.semantic_rank
                                ),
                                0.0
                            ) * :semantic_weight
                            +
                            coalesce(
                                1.0 / (
                                    :rrf_k
                                    + keyword_ranked.keyword_rank
                                ),
                                0.0
                            ) * :keyword_weight
                        ) as retrieval_score

                    from semantic_ranked
                    full outer join keyword_ranked
                        on semantic_ranked.id =
                           keyword_ranked.id
                )

                select
                    kc.id::text as chunk_id,
                    ks.title as source_title,
                    ks.source_type,
                    kc.content,
                    kc.metadata,
                    p.name as product_name,
                    p.sku as product_sku,
                    p.price_inr as product_price_inr,
                    p.weight_grams as product_weight_grams,
                    p.flavour_profile
                        as product_flavour_profile,
                    combined.similarity,
                    combined.retrieval_score
                from combined
                join public.knowledge_chunks kc
                    on kc.id = combined.chunk_id
                join public.knowledge_sources ks
                    on ks.id = kc.source_id
                left join public.products p
                    on p.id = ks.product_id
                order by
                    combined.retrieval_score desc,
                    combined.similarity desc nulls last
                limit :match_count
                """
            ),
            {
                "query_text": cleaned_query,
                "query_embedding": serialized_embedding,
                "embedding_model": embedding_model,
                "candidate_count": candidate_count,
                "match_threshold": match_threshold,
                "match_count": match_count,
                "semantic_weight": semantic_weight,
                "keyword_weight": keyword_weight,
                "rrf_k": rrf_k,
            },
        ).mappings().all()

    return [
        RetrievalResult(
            chunk_id=row["chunk_id"],
            source_title=row["source_title"],
            source_type=row["source_type"],
            content=row["content"],
            metadata=row["metadata"] or {},
            similarity=(
                float(row["similarity"])
                if row["similarity"] is not None
                else 0.0
            ),
            product_name=row["product_name"],
            product_sku=row["product_sku"],
            product_price_inr=row["product_price_inr"],
            product_weight_grams=row["product_weight_grams"],
            product_flavour_profile=(
                row["product_flavour_profile"]
            ),
        )
        for row in rows
    ]

def format_knowledge_context(
    results: list[RetrievalResult],
) -> str:
    if not results:
        return (
            "No relevant WildHive knowledge was retrieved "
            "for this question."
        )

    sections: list[str] = []

    for index, result in enumerate(results, start=1):
        lines = [
            f"[SOURCE {index}]",
            f"Title: {result.source_title}",
            f"Type: {result.source_type}",
            f"Information: {result.content}",
        ]

        if result.product_name:
            lines.extend(
                [
                    "Structured product facts:",
                    f"- Name: {result.product_name}",
                    f"- SKU: {result.product_sku}",
                    f"- Price: ₹{result.product_price_inr}",
                    (
                        f"- Weight: "
                        f"{result.product_weight_grams} grams"
                    ),
                    (
                        f"- Flavour: "
                        f"{result.product_flavour_profile}"
                    ),
                ]
            )

        sections.append("\n".join(lines))

    return "\n\n".join(sections)