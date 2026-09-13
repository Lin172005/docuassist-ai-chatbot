create extension if not exists vector
with schema extensions;


create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    sku text not null unique,
    slug text not null unique,
    name text not null,
    short_description text,
    full_description text,
    price_inr numeric(10, 2) not null
        check (price_inr >= 0),
    weight_grams integer
        check (weight_grams > 0),
    flavour_profile text,
    source_description text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table if not exists public.knowledge_sources (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id)
        on delete cascade,
    source_type text not null
        check (
            source_type in (
                'product',
                'faq',
                'policy',
                'page'
            )
        ),
    source_key text not null,
    title text not null,
    content text not null,
    content_hash text not null,
    metadata jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (source_type, source_key)
);


create table if not exists public.knowledge_chunks (
    id uuid primary key default gen_random_uuid(),
    source_id uuid not null
        references public.knowledge_sources(id)
        on delete cascade,
    chunk_index integer not null
        check (chunk_index >= 0),
    content text not null,
    content_hash text not null,
    token_count integer
        check (token_count is null or token_count > 0),
    metadata jsonb not null default '{}'::jsonb,
    embedding_model text not null,
    embedding extensions.vector(768) not null,
    created_at timestamptz not null default now(),

    unique (source_id, chunk_index)
);


create index if not exists knowledge_sources_product_id_idx
on public.knowledge_sources(product_id);


create index if not exists knowledge_sources_type_idx
on public.knowledge_sources(source_type);


create index if not exists knowledge_chunks_source_id_idx
on public.knowledge_chunks(source_id);


create index if not exists knowledge_chunks_embedding_hnsw_idx
on public.knowledge_chunks
using hnsw (embedding extensions.vector_cosine_ops);


create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


drop trigger if exists products_set_updated_at
on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();


drop trigger if exists knowledge_sources_set_updated_at
on public.knowledge_sources;

create trigger knowledge_sources_set_updated_at
before update on public.knowledge_sources
for each row
execute function public.set_updated_at();


alter table public.products enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;