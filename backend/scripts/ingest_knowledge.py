import hashlib
import json
from typing import Any

from sqlalchemy import text

from app.database import engine
from app.services.chunking_service import chunk_text
from app.services.embedding_service import (
    create_document_embedding,
    embedding_model,
    serialize_embedding,
)


def create_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()




def load_sources() -> list[dict[str, Any]]:
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                """
                select
                    id,
                    source_type,
                    source_key,
                    title,
                    content,
                    content_hash,
                    metadata
                from public.knowledge_sources
                where is_active = true
                order by created_at, id
                """
            )
        ).mappings().all()

    return [dict(row) for row in rows]


def source_is_current(
    source_id: Any,
    chunks: list[str],
) -> bool:
    with engine.connect() as connection:
        existing_rows = connection.execute(
            text(
                """
                select
                    chunk_index,
                    content_hash,
                    embedding_model
                from public.knowledge_chunks
                where source_id = :source_id
                order by chunk_index
                """
            ),
            {"source_id": source_id},
        ).mappings().all()

    if len(existing_rows) != len(chunks):
        return False

    for index, chunk in enumerate(chunks):
        existing = existing_rows[index]

        if existing["chunk_index"] != index:
            return False

        if existing["content_hash"] != create_hash(chunk):
            return False

        if existing["embedding_model"] != embedding_model:
            return False

    return True


def ingest_source(source: dict[str, Any]) -> str:
    chunks = chunk_text(source["content"])

    if not chunks:
        return "empty"

    if source_is_current(source["id"], chunks):
        return "unchanged"

    prepared_chunks = []

    for index, chunk in enumerate(chunks):
        print(
            f"Embedding {source['source_key']} "
            f"chunk {index + 1}/{len(chunks)}..."
        )

        embedding = create_document_embedding(
            title=source["title"],
            content=chunk,
        )

        chunk_metadata = {
            **(source["metadata"] or {}),
            "source_type": source["source_type"],
            "source_key": source["source_key"],
            "source_title": source["title"],
            "source_content_hash": source["content_hash"],
        }

        prepared_chunks.append(
            {
                "source_id": source["id"],
                "chunk_index": index,
                "content": chunk,
                "content_hash": create_hash(chunk),
                "metadata": json.dumps(chunk_metadata),
                "embedding_model": embedding_model,
                "embedding": serialize_embedding(embedding),
            }
        )

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                delete from public.knowledge_chunks
                where source_id = :source_id
                """
            ),
            {"source_id": source["id"]},
        )

        for chunk in prepared_chunks:
            connection.execute(
                text(
                    """
                    insert into public.knowledge_chunks (
                        source_id,
                        chunk_index,
                        content,
                        content_hash,
                        metadata,
                        embedding_model,
                        embedding
                    )
                    values (
                        :source_id,
                        :chunk_index,
                        :content,
                        :content_hash,
                        cast(:metadata as jsonb),
                        :embedding_model,
                        cast(:embedding as extensions.vector)
                    )
                    """
                ),
                chunk,
            )

    return "ingested"


def ingest_knowledge() -> None:
    sources = load_sources()

    ingested = 0
    unchanged = 0
    empty = 0

    for source in sources:
        result = ingest_source(source)

        if result == "ingested":
            ingested += 1
        elif result == "unchanged":
            unchanged += 1
        else:
            empty += 1

    engine.dispose()

    print()
    print("Knowledge ingestion complete.")
    print(f"Sources ingested: {ingested}")
    print(f"Sources unchanged: {unchanged}")
    print(f"Empty sources: {empty}")


if __name__ == "__main__":
    ingest_knowledge()