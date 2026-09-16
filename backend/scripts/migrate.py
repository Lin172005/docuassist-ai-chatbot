import sys
from pathlib import Path

# Ensure backend root is in sys.path when running script directly
backend_root = str(Path(__file__).resolve().parents[1])
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.database import engine

MIGRATIONS_DIR = Path(__file__).resolve().parents[1] / "migrations"

MIGRATION_FILES = [
    "001_create_rag_schema.sql",
    "002_add_full_text_search.sql",
    "003_add_product_management.sql",
    "004_add_field_configs.sql",
]

def run_migrations():
    print(f"Connecting to database to apply migrations from {MIGRATIONS_DIR}...")
    with engine.begin() as connection:
        raw_conn = connection.connection
        cursor = raw_conn.cursor()
        for filename in MIGRATION_FILES:
            filepath = MIGRATIONS_DIR / filename
            if not filepath.exists():
                print(f"[SKIP] Migration file not found: {filename}")
                continue

            print(f"[APPLYING] {filename}...")
            sql = filepath.read_text(encoding="utf-8")
            cursor.execute(sql)
            print(f"[SUCCESS] Applied {filename}")

    print("All migrations applied successfully!")

if __name__ == "__main__":
    run_migrations()
