from sqlalchemy import text

from app.database import engine


def check_database() -> None:
    with engine.connect() as connection:
        database_info = connection.execute(
            text(
                """
                select
                    current_database() as database_name,
                    current_user as database_user,
                    exists (
                        select 1
                        from pg_extension
                        where extname = 'vector'
                    ) as vector_enabled
                """
            )
        ).mappings().one()

        tables = connection.execute(
            text(
                """
                select table_name
                from information_schema.tables
                where table_schema = 'public'
                  and table_name in (
                      'products',
                      'knowledge_sources',
                      'knowledge_chunks'
                  )
                order by table_name
                """
            )
        ).scalars().all()

    engine.dispose()

    print("Database connection successful.")
    print(f"Database: {database_info['database_name']}")
    print(f"Vector enabled: {database_info['vector_enabled']}")
    print(f"RAG tables: {', '.join(tables)}")


if __name__ == "__main__":
    check_database()