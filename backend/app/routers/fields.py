from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_role
from app.database import get_db
from app.models.field_config import FieldConfig, CustomFieldDefinition
from app.models.user import User
from app.schemas.field_config import (
    FieldConfigPayload,
    CustomFieldDefPayload,
    ReorderPayload,
)

router = APIRouter(tags=["Field Configs"])


def _sorted_safe(value: dict, default: int = 9999) -> int:
    try:
        return int(value.get("order", default))
    except (TypeError, ValueError):
        return default


# ── Field Configs ─────────────────────────────────────

@router.get("/api/field-configs", response_model=list[dict])
def list_field_configs(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[dict]:
    rows = db.query(FieldConfig).all()
    rows.sort(key=lambda r: _sorted_safe(r.config))
    return [r.config for r in rows]


@router.put("/api/field-configs/reorder", response_model=dict)
def reorder_field_configs(
    request: ReorderPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    for idx, config_id in enumerate(request.ids):
        row = db.query(FieldConfig).filter(FieldConfig.id == config_id).first()
        if row:
            row.config = {**row.config, "order": idx}
    db.commit()
    return {"detail": "Field configs reordered."}


@router.post(
    "/api/field-configs",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def create_field_config(
    request: FieldConfigPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    existing = db.query(FieldConfig).filter(FieldConfig.id == request.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A field config with id '{request.id}' already exists.",
        )

    row = FieldConfig(id=request.id, config=request.model_dump(exclude_none=False))
    db.add(row)
    db.commit()
    db.refresh(row)
    return row.config


@router.put("/api/field-configs/{config_id}", response_model=dict)
def update_field_config(
    config_id: str,
    request: FieldConfigPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    row = db.query(FieldConfig).filter(FieldConfig.id == config_id).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field config not found.",
        )

    payload = request.model_dump(exclude_none=False)
    if payload["id"] != config_id:
        conflict = db.query(FieldConfig).filter(FieldConfig.id == payload["id"]).first()
        if conflict and conflict.id != row.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A field config with id '{payload['id']}' already exists.",
            )
        row.id = payload["id"]
    row.config = payload
    db.commit()
    db.refresh(row)
    return row.config


@router.delete("/api/field-configs/{config_id}", status_code=status.HTTP_200_OK)
def delete_field_config(
    config_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    row = db.query(FieldConfig).filter(FieldConfig.id == config_id).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field config not found.",
        )

    db.delete(row)
    db.commit()
    return {"detail": "Field config deleted.", "id": config_id}


# ── Custom Field Definitions ──────────────────────────

@router.get("/api/custom-fields", response_model=list[dict])
def list_custom_fields(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[dict]:
    rows = db.query(CustomFieldDefinition).all()
    rows.sort(key=lambda r: _sorted_safe(r.config))
    return [r.config for r in rows]


@router.put("/api/custom-fields/reorder", response_model=dict)
def reorder_custom_fields(
    request: ReorderPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    for idx, field_id in enumerate(request.ids):
        row = db.query(CustomFieldDefinition).filter(
            CustomFieldDefinition.id == field_id
        ).first()
        if row:
            row.config = {**row.config, "order": idx}
    db.commit()
    return {"detail": "Custom fields reordered."}


@router.post(
    "/api/custom-fields",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def create_custom_field(
    request: CustomFieldDefPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    existing = db.query(CustomFieldDefinition).filter(
        CustomFieldDefinition.id == request.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A custom field with id '{request.id}' already exists.",
        )

    row = CustomFieldDefinition(id=request.id, config=request.model_dump(exclude_none=False))
    db.add(row)
    db.commit()
    db.refresh(row)
    return row.config


@router.put("/api/custom-fields/{field_id}", response_model=dict)
def update_custom_field(
    field_id: str,
    request: CustomFieldDefPayload,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    row = db.query(CustomFieldDefinition).filter(
        CustomFieldDefinition.id == field_id
    ).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom field not found.",
        )

    payload = request.model_dump(exclude_none=False)
    if payload["id"] != field_id:
        conflict = db.query(CustomFieldDefinition).filter(
            CustomFieldDefinition.id == payload["id"]
        ).first()
        if conflict and conflict.id != row.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A custom field with id '{payload['id']}' already exists.",
            )
        row.id = payload["id"]
    row.config = payload
    db.commit()
    db.refresh(row)
    return row.config


@router.delete("/api/custom-fields/{field_id}", status_code=status.HTTP_200_OK)
def delete_custom_field(
    field_id: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin", "editor")),
) -> dict:
    row = db.query(CustomFieldDefinition).filter(
        CustomFieldDefinition.id == field_id
    ).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom field not found.",
        )

    db.delete(row)
    db.commit()
    return {"detail": "Custom field deleted.", "id": field_id}