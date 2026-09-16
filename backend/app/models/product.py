import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Product(Base):
    __tablename__ = "products"

    # ── PK ──────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ── Basic info (existing) ───────────────────────────
    sku: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    short_description: Mapped[str | None] = mapped_column(Text)
    full_description: Mapped[str | None] = mapped_column(Text)

    # ── Pricing (existing column kept for RAG compat) ───
    price_inr: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=0
    )

    # ── Physical (existing columns kept for RAG compat) ─
    weight_grams: Mapped[int | None] = mapped_column(Integer)
    flavour_profile: Mapped[str | None] = mapped_column(Text)
    source_description: Mapped[str | None] = mapped_column(Text)

    # ── Status (existing) ───────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )

    # ── Timestamps (existing) ───────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        onupdate=func.now(),
    )

    # ── NEW: Product management columns ─────────────────
    description: Mapped[str | None] = mapped_column(Text)

    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        index=True,
    )
    subcategory: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    currency: Mapped[str] = mapped_column(
        Text, nullable=False, default="INR"
    )
    sale_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    price_tiers: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    low_stock_threshold: Mapped[int] = mapped_column(
        Integer, nullable=False, default=10
    )
    allow_backorder: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    images: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    variants: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    weight_unit: Mapped[str] = mapped_column(Text, nullable=False, default="kg")
    dimensions: Mapped[dict | None] = mapped_column(JSONB)
    dimension_unit: Mapped[str] = mapped_column(
        Text, nullable=False, default="cm"
    )
    barcode: Mapped[str | None] = mapped_column(Text)

    related_product_ids: Mapped[list] = mapped_column(
        JSONB, nullable=False, default=list
    )
    cross_sell_ids: Mapped[list] = mapped_column(
        JSONB, nullable=False, default=list
    )
    seo: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    custom_fields: Mapped[dict] = mapped_column(
        JSONB, nullable=False, default=dict
    )

    # draft / published / archived
    status: Mapped[str] = mapped_column(
        Text, nullable=False, default="draft", index=True
    )

    # ── Relationships ───────────────────────────────────
    category: Mapped["Category | None"] = relationship(
        "Category", back_populates="products", lazy="joined"
    )
