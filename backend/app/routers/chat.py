from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatSource,
)
from app.services.gemini_service import generate_reply
from app.services.retrieval_service import (
    build_retrieval_query,
    format_knowledge_context,
    retrieve_knowledge,
)

router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        retrieval_query = build_retrieval_query(
            message=request.message,
            conversation_history=request.conversation_history,
        )

        results = retrieve_knowledge(retrieval_query)
        knowledge_context = format_knowledge_context(results)

        reply, interaction_id = generate_reply(
            message=request.message,
            knowledge_context=knowledge_context,
            previous_interaction_id=(
                request.previous_interaction_id
            ),
        )

        sources: list[ChatSource] = []
        seen_sources: set[tuple[str, str]] = set()

        for result in results:
            source_key = (
                result.source_title,
                result.source_type,
            )

            if source_key in seen_sources:
                continue

            seen_sources.add(source_key)

            sources.append(
                ChatSource(
                    title=result.source_title,
                    source_type=result.source_type,
                    similarity=round(
                        result.similarity,
                        4,
                    ),
                )
            )

        return ChatResponse(
            reply=reply,
            interaction_id=interaction_id,
            sources=sources,
        )

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI assistant is temporarily unavailable.",
        ) from error