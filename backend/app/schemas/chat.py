from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=1000,
        description="The customer's question for the WildHive assistant.",
    )
    previous_interaction_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    interaction_id: str