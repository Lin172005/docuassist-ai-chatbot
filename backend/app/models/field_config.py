from datetime import datetime

from sqlalchemy import DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class FieldConfig(Base):
    """Configuration for a built-in field shown on the product form.

    ``config`` stores the full frontend ``FieldConfig`` object (label, type,
    group, enabled, required, order, validation, ...) as JSONB so it can
    evolve without schema changes.
    """

    __tablename__ = "field_configs"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        onupdate=func.now(),
    )


class CustomFieldDefinition(Base):
    """Definition for a store-specific custom field on the product form.

    ``config`` stores the full frontend ``CustomFieldDef`` object as JSONB.
    """

    __tablename__ = "custom_field_defs"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        onupdate=func.now(),
    )