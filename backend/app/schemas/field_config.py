from typing import Any

from pydantic import BaseModel, Field


class FieldConfigPayload(BaseModel):
    """Full frontend `FieldConfig` object, stored as JSONB config."""

    id: str = Field(min_length=1)
    label: str = ""
    type: str = "text"
    group: str = ""
    enabled: bool = True
    required: bool = False
    order: int = 0
    placeholder: str | None = None
    helpText: str | None = None
    defaultValue: Any = None
    options: list[dict] | None = None
    validation: dict | None = None
    dependsOn: dict | None = None

    model_config = {"extra": "allow"}


class CustomFieldDefPayload(BaseModel):
    """Full frontend `CustomFieldDef` object, stored as JSONB config."""

    id: str = Field(min_length=1)
    name: str = ""
    type: str = "text"
    group: str = ""
    enabled: bool = True
    order: int = 0
    options: list[dict] | None = None
    defaultValue: Any = None

    model_config = {"extra": "allow"}


class ReorderPayload(BaseModel):
    ids: list[str] = Field(default_factory=list)