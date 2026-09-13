alter table public.knowledge_chunks
add column if not exists fts tsvector
generated always as (
    setweight(
        to_tsvector(
            'english',
            coalesce(metadata ->> 'source_title', '')
        ),
        'A'
    )
    ||
    setweight(
        to_tsvector(
            'simple',
            coalesce(metadata ->> 'sku', '')
        ),
        'A'
    )
    ||
    setweight(
        to_tsvector(
            'english',
            coalesce(content, '')
        ),
        'B'
    )
) stored;


create index if not exists knowledge_chunks_fts_idx
on public.knowledge_chunks
using gin (fts);