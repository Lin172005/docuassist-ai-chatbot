from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import generate_reply


router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        reply, interaction_id = generate_reply(
            message=request.message,
            previous_interaction_id=request.previous_interaction_id,
        )

        return ChatResponse(
            reply=reply,
            interaction_id=interaction_id,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI assistant is temporarily unavailable.",
        ) from error