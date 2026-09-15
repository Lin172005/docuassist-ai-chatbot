-- Migration 004: Field configs & custom field definitions
-- Persists the admin product form configuration (field configs) and
-- store-specific custom field definitions in PostgreSQL instead of
-- browser localStorage, so all admins share the same configuration.
--
-- Apply:  psql -d docuassist -f migrations/004_add_field_configs.sql
-- Revert: See DOWN section at bottom of this file.


-- ============================================================
-- 0. Ensure the shared updated_at helper exists (created by 001;
--    guarded here so this migration is self-contained)
-- ============================================================

do $guard$
begin
    if not exists (select 1 from pg_proc where proname = 'set_updated_at') then
        create or replace function public.set_updated_at()
        returns trigger
        language plpgsql
        as $func$
        begin
            new.updated_at := now();
            return new;
        end;
        $func$;
    end if;
end
$guard$;


-- ============================================================
-- 1. field_configs table
--    config stores the full frontend FieldConfig JSON object
--    (label, type, group, enabled, required, order, validation, ...)
-- ============================================================

create table if not exists public.field_configs (
    id text primary key,
    config jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger field_configs_set_updated_at
before update on public.field_configs
for each row
execute function public.set_updated_at();


-- ============================================================
-- 2. custom_field_defs table
--    config stores the full frontend CustomFieldDef JSON object
-- ============================================================

create table if not exists public.custom_field_defs (
    id text primary key,
    config jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger custom_field_defs_set_updated_at
before update on public.custom_field_defs
for each row
execute function public.set_updated_at();


-- ============================================================
-- 3. Seed default field configs (mirrors DEFAULT_FIELD_CONFIGS)
-- ============================================================

insert into public.field_configs (id, config) values
('name', '{"id":"name","label":"Product Name","type":"text","group":"Basic Info","enabled":true,"required":true,"order":0,"placeholder":"e.g. Multi Flower Honey","validation":{"maxLength":200}}'::jsonb),
('slug', '{"id":"slug","label":"URL Slug","type":"text","group":"Basic Info","enabled":true,"required":true,"order":1,"placeholder":"auto-generated"}'::jsonb),
('description', '{"id":"description","label":"Description","type":"richtext","group":"Basic Info","enabled":true,"required":false,"order":2}'::jsonb),
('status', '{"id":"status","label":"Status","type":"select","group":"Basic Info","enabled":true,"required":true,"order":3,"options":[{"label":"Draft","value":"draft"},{"label":"Published","value":"published"},{"label":"Archived","value":"archived"}],"defaultValue":"draft"}'::jsonb),
('scheduledPublishAt', '{"id":"scheduledPublishAt","label":"Schedule Publish","type":"datetime","group":"Basic Info","enabled":true,"required":false,"order":4,"dependsOn":{"field":"status","value":"draft"}}'::jsonb),
('category', '{"id":"category","label":"Category","type":"select","group":"Basic Info","enabled":true,"required":true,"order":5}'::jsonb),
('subcategory', '{"id":"subcategory","label":"Subcategory","type":"select","group":"Basic Info","enabled":true,"required":false,"order":6}'::jsonb),
('tags', '{"id":"tags","label":"Tags","type":"tags","group":"Basic Info","enabled":true,"required":false,"order":7}'::jsonb),
('price', '{"id":"price","label":"Price","type":"currency","group":"Pricing","enabled":true,"required":true,"order":0}'::jsonb),
('currency', '{"id":"currency","label":"Currency","type":"select","group":"Pricing","enabled":true,"required":true,"order":1,"options":[{"label":"INR (₹)","value":"INR"},{"label":"USD ($)","value":"USD"},{"label":"EUR (€)","value":"EUR"},{"label":"GBP (£)","value":"GBP"}],"defaultValue":"INR"}'::jsonb),
('salePrice', '{"id":"salePrice","label":"Sale Price","type":"currency","group":"Pricing","enabled":true,"required":false,"order":2}'::jsonb),
('priceTiers', '{"id":"priceTiers","label":"Bulk Pricing","type":"json","group":"Pricing","enabled":true,"required":false,"order":3}'::jsonb),
('sku', '{"id":"sku","label":"SKU","type":"text","group":"Inventory","enabled":true,"required":true,"order":0,"placeholder":"Auto-generated"}'::jsonb),
('barcode', '{"id":"barcode","label":"Barcode / UPC","type":"text","group":"Inventory","enabled":true,"required":false,"order":1}'::jsonb),
('stock', '{"id":"stock","label":"Stock Quantity","type":"number","group":"Inventory","enabled":true,"required":true,"order":2}'::jsonb),
('lowStockThreshold', '{"id":"lowStockThreshold","label":"Low Stock Alert","type":"number","group":"Inventory","enabled":true,"required":false,"order":3,"defaultValue":10}'::jsonb),
('allowBackorder', '{"id":"allowBackorder","label":"Allow Backorder","type":"toggle","group":"Inventory","enabled":true,"required":false,"order":4,"defaultValue":false}'::jsonb),
('variants', '{"id":"variants","label":"Variants","type":"json","group":"Inventory","enabled":true,"required":false,"order":5}'::jsonb),
('images', '{"id":"images","label":"Product Images","type":"image","group":"Media","enabled":true,"required":false,"order":0}'::jsonb),
('weight', '{"id":"weight","label":"Weight","type":"number","group":"Shipping","enabled":true,"required":false,"order":0}'::jsonb),
('weightUnit', '{"id":"weightUnit","label":"Weight Unit","type":"select","group":"Shipping","enabled":true,"required":false,"order":1,"options":[{"label":"kg","value":"kg"},{"label":"g","value":"g"},{"label":"lb","value":"lb"},{"label":"oz","value":"oz"}],"defaultValue":"kg"}'::jsonb),
('dimensions', '{"id":"dimensions","label":"Dimensions (L×W×H)","type":"json","group":"Shipping","enabled":true,"required":false,"order":2}'::jsonb),
('dimensionUnit', '{"id":"dimensionUnit","label":"Dimension Unit","type":"select","group":"Shipping","enabled":true,"required":false,"order":3,"options":[{"label":"cm","value":"cm"},{"label":"in","value":"in"},{"label":"m","value":"m"}],"defaultValue":"cm"}'::jsonb),
('seo.metaTitle', '{"id":"seo.metaTitle","label":"Meta Title","type":"text","group":"SEO","enabled":true,"required":false,"order":0,"placeholder":"Inherits from name"}'::jsonb),
('seo.metaDescription', '{"id":"seo.metaDescription","label":"Meta Description","type":"textarea","group":"SEO","enabled":true,"required":false,"order":1,"placeholder":"Inherits from description"}'::jsonb),
('seo.keywords', '{"id":"seo.keywords","label":"Keywords","type":"tags","group":"SEO","enabled":true,"required":false,"order":2}'::jsonb),
('seo.template', '{"id":"seo.template","label":"SEO Template","type":"select","group":"SEO","enabled":true,"required":false,"order":3,"options":[{"label":"Default","value":"default"},{"label":"Product Page","value":"product"},{"label":"Category Page","value":"category"}],"defaultValue":"default"}'::jsonb),
('relatedProductIds', '{"id":"relatedProductIds","label":"Related Products","type":"json","group":"Relations","enabled":true,"required":false,"order":0}'::jsonb),
('crossSellIds', '{"id":"crossSellIds","label":"Cross-sell Products","type":"json","group":"Relations","enabled":true,"required":false,"order":1}'::jsonb)
on conflict (id) do nothing;


-- ============================================================
-- DOWN: Revert this migration
-- ============================================================
-- WARNING: This will remove all field configs and custom field
-- definitions saved in the database.
--
-- drop trigger if exists custom_field_defs_set_updated_at on public.custom_field_defs;
-- drop trigger if exists field_configs_set_updated_at on public.field_configs;
-- drop table if exists public.custom_field_defs;
-- drop table if exists public.field_configs;