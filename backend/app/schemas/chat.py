from pydantic import BaseModel, Field
from typing import Literal

class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(
        min_length=1,
        max_length=2000,
    )

class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=1000,
        description="The customer's question for WildHive.",
    )
    previous_interaction_id: str | None = None
    conversation_history: list[ConversationMessage] = Field(
        default_factory=list,
        max_length=6,
    )

class ChatSource(BaseModel):
    title: str
    source_type: str
    similarity: float


class ChatResponse(BaseModel):
    reply: str
    interaction_id: str
    sources: list[ChatSource] = Field(default_factory=list)