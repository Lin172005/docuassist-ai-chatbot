-- Migration 003: Add Product Management
-- Extends the existing products table with management fields.
-- Creates categories and users tables.
-- Preserves all existing data and RAG functionality.
--
-- Apply:  psql -d docuassist -f migrations/003_add_product_management.sql
-- Revert: See DOWN section at bottom of this file.


-- ============================================================
-- 1. Categories table
-- ============================================================

create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    description text,
    parent_id uuid references public.categories(id)
        on delete set null,
    status text not null default 'active'
        check (status in ('active', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists categories_parent_id_idx
on public.categories(parent_id);

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();


-- ============================================================
-- 2. Extend products table with management columns
-- ============================================================

-- description (separate from full_description used by RAG)
alter table public.products
add column if not exists description text;

-- category reference
alter table public.products
add column if not exists category_id uuid
    references public.categories(id)
    on delete set null;

create index if not exists products_category_id_idx
on public.products(category_id);

-- subcategory
alter table public.products
add column if not exists subcategory text;

-- tags (JSONB array)
alter table public.products
add column if not exists tags jsonb
    not null default '[]'::jsonb;

-- currency
alter table public.products
add column if not exists currency text
    not null default 'INR';

-- sale_price
alter table public.products
add column if not exists sale_price numeric(10, 2);

-- price_tiers (JSONB array of tier objects)
alter table public.products
add column if not exists price_tiers jsonb
    not null default '[]'::jsonb;

-- stock quantity
alter table public.products
add column if not exists stock integer
    not null default 0;

-- low stock threshold
alter table public.products
add column if not exists low_stock_threshold integer
    not null default 10;

-- allow backorder
alter table public.products
add column if not exists allow_backorder boolean
    not null default false;

-- images (JSONB array of image objects)
alter table public.products
add column if not exists images jsonb
    not null default '[]'::jsonb;

-- variants (JSONB array of variant objects)
alter table public.products
add column if not exists variants jsonb
    not null default '[]'::jsonb;

-- weight unit
alter table public.products
add column if not exists weight_unit text
    not null default 'kg';

-- dimensions (JSONB object)
alter table public.products
add column if not exists dimensions jsonb;

-- dimension unit
alter table public.products
add column if not exists dimension_unit text
    not null default 'cm';

-- barcode
alter table public.products
add column if not exists barcode text;

-- related product IDs
alter table public.products
add column if not exists related_product_ids jsonb
    not null default '[]'::jsonb;

-- cross-sell IDs
alter table public.products
add column if not exists cross_sell_ids jsonb
    not null default '[]'::jsonb;

-- SEO metadata (JSONB object)
alter table public.products
add column if not exists seo jsonb
    not null default '{}'::jsonb;

-- custom fields (JSONB object)
alter table public.products
add column if not exists custom_fields jsonb
    not null default '{}'::jsonb;

-- product status (draft / published / archived)
alter table public.products
add column if not exists status text
    not null default 'draft';

create index if not exists products_status_idx
on public.products(status);


-- ============================================================
-- 3. Users table (for admin authentication)
-- ============================================================

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    hashed_password text not null,
    full_name text,
    role text not null default 'viewer'
        check (role in ('admin', 'editor', 'viewer')),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create index if not exists users_email_idx
on public.users(email);


-- ============================================================
-- 4. Seed default categories
-- ============================================================

insert into public.categories (name, slug, status)
values
    ('Honey', 'honey', 'active'),
    ('Equipment', 'equipment', 'active'),
    ('Bees', 'bees', 'active')
on conflict (slug) do nothing;

-- Honey subcategories
insert into public.categories (name, slug, parent_id, status)
select sub.name, sub.slug, p.id, 'active'
from (values
    ('Multi Flower', 'multi-flower'),
    ('Forest', 'forest'),
    ('Kombu', 'kombu'),
    ('Murngai', 'murngai'),
    ('Stingless Bee', 'stingless-bee')
) as sub(name, slug)
cross join public.categories p
where p.slug = 'honey'
on conflict (slug) do nothing;

-- Equipment subcategories
insert into public.categories (name, slug, parent_id, status)
select sub.name, sub.slug, p.id, 'active'
from (values
    ('Bee Boxes', 'bee-boxes'),
    ('Tools', 'tools'),
    ('Protective Gear', 'protective-gear')
) as sub(name, slug)
cross join public.categories p
where p.slug = 'equipment'
on conflict (slug) do nothing;

-- Bees subcategories
insert into public.categories (name, slug, parent_id, status)
select sub.name, sub.slug, p.id, 'active'
from (values
    ('Italian', 'italian'),
    ('Carnolian', 'carnolian'),
    ('Russian', 'russian')
) as sub(name, slug)
cross join public.categories p
where p.slug = 'bees'
on conflict (slug) do nothing;


-- ============================================================
-- 5. Default admin user
--    Email: admin@wildhive.com
--    Pass:  admin123
--    Hash generated with: passlib bcrypt
-- ============================================================

insert into public.users (email, hashed_password, full_name, role, is_active)
values (
    'admin@wildhive.com',
    '$2b$12$JGWeqhO0mRIjsyCS0MV/9.7f5z8P2CH8msZDb4LhtQDYau601qiga',
    'Admin',
    'admin',
    true
)
on conflict (email) do nothing;


-- ============================================================
-- DOWN: Revert this migration
-- ============================================================
-- Run these commands to undo the changes above.
-- WARNING: This will remove the new columns and tables.
-- Existing products data in new columns will be lost.
-- Existing RAG data is NOT affected.
--
-- drop trigger if exists categories_set_updated_at on public.categories;
-- drop table if exists public.users;
-- alter table public.products drop column if exists custom_fields;
-- alter table public.products drop column if exists seo;
-- alter table public.products drop column if exists cross_sell_ids;
-- alter table public.products drop column if exists related_product_ids;
-- alter table public.products drop column if exists barcode;
-- alter table public.products drop column if exists dimension_unit;
-- alter table public.products drop column if exists dimensions;
-- alter table public.products drop column if exists weight_unit;
-- alter table public.products drop column if exists variants;
-- alter table public.products drop column if exists images;
-- alter table public.products drop column if exists allow_backorder;
-- alter table public.products drop column if exists low_stock_threshold;
-- alter table public.products drop column if exists stock;
-- alter table public.products drop column if exists price_tiers;
-- alter table public.products drop column if exists sale_price;
-- alter table public.products drop column if exists currency;
-- alter table public.products drop column if exists tags;
-- alter table public.products drop column if exists subcategory;
-- alter table public.products drop column if exists category_id;
-- alter table public.products drop column if exists description;
-- drop index if exists products_status_idx;
-- drop index if exists products_category_id_idx;
-- drop table if exists public.categories;
