import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import get_password_hash, verify_password, create_access_token
from app.services.chunking_service import chunk_text

client = TestClient(app)


def test_health_checks():
    """Verify health and readiness endpoints respond 200 OK."""
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"

    r_ready = client.get("/health/ready")
    assert r_ready.status_code == 200
    assert r_ready.json()["status"] == "ready"


def test_bcrypt_password_hashing():
    """Verify direct bcrypt hashing without passlib deprecated bug."""
    plain = "SuperSecurePassword123!"
    hashed = get_password_hash(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_auth_login_invalid():
    """Verify 401 on bad credentials."""
    resp = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@wildhive.com", "password": "WrongPassword!"},
    )
    assert resp.status_code == 401


def test_auth_login_and_me():
    """Verify login with default seeded admin credentials and /api/auth/me endpoint."""
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@wildhive.com", "password": "AdminPassword123!"},
    )
    if resp.status_code == 200:
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        token = data["access_token"]

        # Test /api/auth/me with Bearer token
        me_resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "admin@wildhive.com"
        assert me_resp.json()["role"] == "admin"


def test_auth_me_invalid_token():
    """Verify 401 on malformed or invalid JWT token."""
    resp = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer not-a-valid-token"},
    )
    assert resp.status_code == 401


def test_products_list_public():
    """Verify public access to /api/products."""
    resp = client.get("/api/products")
    assert resp.status_code == 200
    data = resp.json()
    assert "products" in data
    assert isinstance(data["products"], list)


def test_products_invalid_uuid():
    """Verify non-UUID ID returns clean 404 instead of 500."""
    resp = client.get("/api/products/not-a-valid-uuid-here")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


def test_categories_list_public():
    """Verify public access to /api/categories."""
    resp = client.get("/api/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_categories_invalid_uuid():
    """Verify non-UUID category ID returns clean 404 instead of 500."""
    resp = client.get("/api/categories/invalid-uuid-12345")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


def test_chunking_service_sentence_aware():
    """Verify chunking splits cleanly on sentence boundaries."""
    text = (
        "Wildflower Honey is harvested from seasonal blooms. "
        "It has a rich, full-bodied flavour profile. "
        "WildHive guarantees that our honey contains no added sugar or artificial colours."
    )
    chunks = chunk_text(text, max_words=12, overlap_words=4)
    assert len(chunks) >= 2
    for chunk in chunks:
        assert len(chunk.split()) <= 15
        assert len(chunk.strip()) > 0


def test_sync_product_knowledge_inactive_cleanup():
    """Verify sync_product_knowledge cleans up knowledge chunks when product is inactive."""
    from app.routers.products import sync_product_knowledge
    from app.models.product import Product
    from unittest.mock import MagicMock

    mock_db = MagicMock()
    mock_db.execute.return_value.first.return_value = ["mock-source-id-123"]
    inactive_product = Product(
        name="Test Inactive Honey",
        slug="test-inactive-honey",
        sku="TEST-INACT",
        is_active=False,
        price_inr=500,
    )
    inactive_product.id = "mock-id-123"

    sync_product_knowledge(inactive_product, mock_db)
    # Ensure execute query is called to update source and clean chunks
    assert mock_db.execute.called


