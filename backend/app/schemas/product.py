from pydantic import BaseModel, Field
from datetime import datetime


# ── Category Schemas ───────────────────────────────────
class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    description: str | None = None
    parent_id: str | None = None
    status: str = Field(default="active", pattern="^(active|inactive)$")


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    parent_id: str | None = None
    status: str | None = Field(default=None, pattern="^(active|inactive)$")


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    parent_id: str | None
    status: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# ── Product Schemas ────────────────────────────────────
class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    category_id: str | None = None
    subcategory: str | None = None
    tags: list[str] = Field(default_factory=list)

    price: float = Field(ge=0)
    currency: str = Field(default="INR", max_length=3)
    sale_price: float | None = None
    price_tiers: list[dict] = Field(default_factory=list)

    sku: str = Field(min_length=1, max_length=100)
    barcode: str | None = None
    stock: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    allow_backorder: bool = False
    variants: list[dict] = Field(default_factory=list)

    images: list[dict] = Field(default_factory=list)

    weight: float | None = None
    weight_unit: str = Field(default="kg", max_length=5)
    dimensions: dict | None = None
    dimension_unit: str = Field(default="cm", max_length=5)

    related_product_ids: list[str] = Field(default_factory=list)
    cross_sell_ids: list[str] = Field(default_factory=list)
    seo: dict = Field(default_factory=dict)
    custom_fields: dict = Field(default_factory=dict)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = Field(default=None, pattern="^(draft|published|archived)$")
    category_id: str | None = None
    subcategory: str | None = None
    tags: list[str] | None = None

    price: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, max_length=3)
    sale_price: float | None = None
    price_tiers: list[dict] | None = None

    sku: str | None = Field(default=None, min_length=1, max_length=100)
    barcode: str | None = None
    stock: int | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)
    allow_backorder: bool | None = None
    variants: list[dict] | None = None

    images: list[dict] | None = None

    weight: float | None = None
    weight_unit: str | None = Field(default=None, max_length=5)
    dimensions: dict | None = None
    dimension_unit: str | None = Field(default=None, max_length=5)

    related_product_ids: list[str] | None = None
    cross_sell_ids: list[str] | None = None
    seo: dict | None = None
    custom_fields: dict | None = None


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    sku: str
    description: str | None
    short_description: str | None
    full_description: str | None
    status: str
    category_id: str | None
    category_name: str | None
    subcategory: str | None
    tags: list[str]

    price: float
    price_inr: float
    currency: str
    sale_price: float | None
    price_tiers: list[dict]

    stock: int
    low_stock_threshold: int
    allow_backorder: bool
    variants: list[dict]

    images: list[dict]

    weight: float | None
    weight_grams: int | None
    weight_unit: str
    dimensions: dict | None
    dimension_unit: str
    barcode: str | None

    flavour_profile: str | None
    source_description: str | None
    related_product_ids: list[str]
    cross_sell_ids: list[str]
    seo: dict
    custom_fields: dict
    is_active: bool

    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
