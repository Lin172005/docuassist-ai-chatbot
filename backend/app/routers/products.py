import uuid
import math
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_role
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)

router = APIRouter(prefix="/api/products", tags=["Products"])


def _optional_current_user(
    token: Optional[str] = None,
    db: Session = None,
) -> Optional[User]:
    """Try to get current user from optional token, return None if not authenticated."""
    if not token or db is None:
        return None
    try:
        import jwt as pyjwt
        from app.auth import SECRET_KEY, ALGORITHM
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
            return user
    except Exception:
        pass
    return None


def product_to_response(p: Product) -> ProductResponse:
    return ProductResponse(
        id=str(p.id),
        name=p.name,
        slug=p.slug,
        sku=p.sku,
        description=p.description or p.full_description,
        short_description=p.short_description,
        full_description=p.full_description,
        status=p.status,
        category_id=str(p.category_id) if p.category_id else None,
        category_name=p.category.name if p.category else None,
        subcategory=p.subcategory,
        tags=p.tags or [],
        price=float(p.price_inr),
        price_inr=float(p.price_inr),
        currency=p.currency,
        sale_price=float(p.sale_price) if p.sale_price else None,
        price_tiers=p.price_tiers or [],
        stock=p.stock,
        low_stock_threshold=p.low_stock_threshold,
        allow_backorder=p.allow_backorder,
        variants=p.variants or [],
        images=p.images or [],
        weight=float(p.weight_grams / 1000) if p.weight_grams else None,
        weight_grams=p.weight_grams,
        weight_unit=p.weight_unit,
        dimensions=p.dimensions,
        dimension_unit=p.dimension_unit,
        barcode=p.barcode,
        flavour_profile=p.flavour_profile,
        source_description=p.source_description,
        related_product_ids=p.related_product_ids or [],
        cross_sell_ids=p.cross_sell_ids or [],
        seo=p.seo or {},
        custom_fields=p.custom_fields or {},
        is_active=p.is_active,
        created_at=p.created_at.isoformat() if p.created_at else "",
        updated_at=p.updated_at.isoformat() if p.updated_at else "",
    )


@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    search: str | None = None,
    token: str | None = Query(None),
    db: Session = Depends(get_db),
) -> ProductListResponse:
    query = db.query(Product)

    # Check if user is admin/editor (can see all products)
    current_user = _optional_current_user(token, db) if token else None
    is_admin_or_editor = current_user and current_user.role in ("admin", "editor")

    if status_filter:
        query = query.filter(Product.status == status_filter)
    elif not is_admin_or_editor:
        # Public users only see published, active products
        query = query.filter(Product.status == "published", Product.is_active == True)

    if category:
        cat = db.query(Category).filter(Category.name == category).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    if search:
        ilike = f"%{search}%"
        query = query.filter(
            Product.name.ilike(ilike)
            | Product.sku.ilike(ilike)
            | Product.description.ilike(ilike)
        )

    total = query.count()
    total_pages = math.ceil(total / per_page) if total > 0 else 1

    products = (
        query
        .order_by(Product.updated_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return ProductListResponse(
        products=[product_to_response(p) for p in products],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str,
    db: Session = Depends(get_db),
) -> ProductResponse:
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.status == "published",
        Product.is_active == True,
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )
    return product_to_response(product)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    request: ProductCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> ProductResponse:
    existing = db.query(Product).filter(
        (Product.sku == request.sku) | (Product.slug == request.slug)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU or slug already exists.",
        )

    product = Product(
        name=request.name,
        slug=request.slug,
        description=request.description,
        full_description=request.description,
        status=request.status,
        category_id=uuid.UUID(request.category_id) if request.category_id else None,
        subcategory=request.subcategory,
        tags=request.tags,
        price_inr=request.price,
        currency=request.currency,
        sale_price=request.sale_price,
        price_tiers=request.price_tiers,
        sku=request.sku,
        barcode=request.barcode,
        stock=request.stock,
        low_stock_threshold=request.low_stock_threshold,
        allow_backorder=request.allow_backorder,
        variants=request.variants,
        images=request.images,
        weight_grams=int(request.weight * 1000) if request.weight and request.weight_unit == "kg" else (int(request.weight) if request.weight and request.weight_unit == "g" else None),
        weight_unit=request.weight_unit,
        dimensions=request.dimensions,
        dimension_unit=request.dimension_unit,
        related_product_ids=request.related_product_ids,
        cross_sell_ids=request.cross_sell_ids,
        seo=request.seo,
        custom_fields=request.custom_fields,
        is_active=(request.status == "published"),
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product_to_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    request: ProductUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> ProductResponse:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    update_data = request.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        update_data["category_id"] = (
            uuid.UUID(update_data["category_id"]) if update_data["category_id"] else None
        )

    if "sku" in update_data or "slug" in update_data:
        check_q = db.query(Product).filter(Product.id != product.id)
        if "sku" in update_data:
            check_q = check_q.filter(Product.sku == update_data["sku"])
        if "slug" in update_data:
            check_q = check_q.filter(Product.slug == update_data["slug"])
        if check_q.first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A product with this SKU or slug already exists.",
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    if "status" in update_data:
        product.is_active = update_data["status"] == "published"

    if "description" in update_data and update_data["description"] is not None:
        product.full_description = update_data["description"]

    if "weight" in update_data and "weight_unit" in update_data:
        w = update_data["weight"]
        u = update_data["weight_unit"]
        if w is not None:
            product.weight_grams = int(w * 1000) if u == "kg" else int(w) if u == "g" else product.weight_grams

    product.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(product)

    return product_to_response(product)


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin")),
) -> dict:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    product.status = "archived"
    product.is_active = False
    product.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"detail": "Product archived.", "id": product_id}
