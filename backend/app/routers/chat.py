from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse


router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    message = request.message.lower()

    if "wildflower" in message:
        reply = (
            "Wildflower Honey is a smooth, floral honey collected from bees "
            "foraging across seasonal wildflowers. A 500 g jar costs ₹349."
        )
    elif "forest" in message:
        reply = (
            "Forest Honey has a rich, full-bodied flavour and is sourced from "
            "flowering trees in natural forest regions. A 500 g jar costs ₹449."
        )
    elif "jamun" in message:
        reply = (
            "Jamun Honey has a deep colour and a mildly tangy flavour from "
            "Jamun blossoms. A 500 g jar costs ₹399."
        )
    elif "price" in message or "cost" in message:
        reply = (
            "Our 500 g varieties are Wildflower Honey at ₹349, "
            "Jamun Honey at ₹399, and Forest Honey at ₹449."
        )
    else:
        reply = (
            "I can currently help you with Wildflower Honey, Forest Honey, "
            "Jamun Honey, and their prices. What would you like to know?"
        )

    return ChatResponse(reply=reply)