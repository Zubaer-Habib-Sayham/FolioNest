begin;
create table public.portfolios (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 100),
 slug text unique check (slug is null or (char_length(slug) between 3 and 64 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
 theme_id text not null check (theme_id in ('editorial','bento','motion','quest')),
 data jsonb not null check (jsonb_typeof(data)='object' and data->>'version'='1' and octet_length(data::text)<=2000000),
 published_data jsonb check (published_data is null or (jsonb_typeof(published_data)='object' and octet_length(published_data::text)<=2000000)),
 is_published boolean not null default false,
 is_indexable boolean not null default false,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint indexable_requires_published check (not is_indexable or is_published),
 constraint publication_requires_content check (not is_published or (slug is not null and published_data is not null and published_at is not null and published_data->>'sample'='false' and char_length(trim(published_data->'identity'->>'name'))>0 and char_length(trim(published_data->'identity'->>'headline'))>0))
);
create index portfolios_owner_updated on public.portfolios(owner_id,updated_at desc);
create index portfolios_sitemap on public.portfolios(slug,published_at) where is_published and is_indexable;
alter table public.portfolios enable row level security;
revoke all on public.portfolios from anon, authenticated;
grant select on public.portfolios to authenticated;
create policy owners_read on public.portfolios for select to authenticated using ((select auth.uid())=owner_id);
comment on table public.portfolios is 'Private drafts and explicit publication snapshots. Writes go through the authenticated application server. Public responses project only published visible fields.';
commit;
