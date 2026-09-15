import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_role
from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.product import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

router = APIRouter(prefix="/api/categories", tags=["Categories"])


def category_to_response(c: Category) -> CategoryResponse:
    return CategoryResponse(
        id=str(c.id),
        name=c.name,
        slug=c.slug,
        description=c.description,
        parent_id=str(c.parent_id) if c.parent_id else None,
        status=c.status,
        created_at=c.created_at.isoformat() if c.created_at else "",
        updated_at=c.updated_at.isoformat() if c.updated_at else "",
    )


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryResponse]:
    categories = db.query(Category).filter(Category.parent_id == None).order_by(Category.name).all()  # noqa: E711
    result: list[CategoryResponse] = []
    for cat in categories:
        result.append(category_to_response(cat))
        for child in sorted(cat.children, key=lambda c: c.name):
            result.append(category_to_response(child))
    return result


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: str,
    db: Session = Depends(get_db),
) -> CategoryResponse:
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )
    return category_to_response(cat)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    request: CategoryCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin")),
) -> CategoryResponse:
    existing = db.query(Category).filter(Category.slug == request.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this slug already exists.",
        )

    cat = Category(
        name=request.name,
        slug=request.slug,
        description=request.description,
        parent_id=uuid.UUID(request.parent_id) if request.parent_id else None,
        status=request.status,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)

    return category_to_response(cat)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    request: CategoryUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin")),
) -> CategoryResponse:
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    update_data = request.model_dump(exclude_unset=True)

    if "slug" in update_data:
        existing = db.query(Category).filter(
            Category.slug == update_data["slug"], Category.id != cat.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A category with this slug already exists.",
            )

    if "parent_id" in update_data:
        update_data["parent_id"] = (
            uuid.UUID(update_data["parent_id"]) if update_data["parent_id"] else None
        )

    for key, value in update_data.items():
        setattr(cat, key, value)

    cat.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cat)

    return category_to_response(cat)


@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin")),
) -> dict:
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    if cat.children:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a category that has subcategories.",
        )

    db.delete(cat)
    db.commit()

    return {"detail": "Category deleted.", "id": category_id}
