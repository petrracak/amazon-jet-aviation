-- Amazon Jet Aviation — schema inicial
-- Convenções: identificadores em minúsculas, chaves primárias uuid,
-- RLS habilitada em toda tabela exposta ao PostgREST.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Equipe (quem acessa o painel)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Pessoas com acesso ao painel. Uma linha por usuário do Supabase Auth.';

-- Quem tem linha em profiles é da equipe. Security definer para não exigir
-- que a política de cada tabela leia profiles sob RLS.
create function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
  );
$$;

create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Catálogo de peças
-- ---------------------------------------------------------------------------

create table public.parts (
  id uuid primary key default gen_random_uuid(),
  pn text not null unique,
  name text not null,
  description text,
  manufacturer text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.parts is 'Catálogo de referência para a busca por part number. Não é estoque.';

-- Busca por trecho do part number e do nome: trigrama resolve o caso real,
-- em que a pessoa digita parte do código.
create index parts_pn_trgm_idx on public.parts using gin (pn gin_trgm_ops);
create index parts_name_trgm_idx on public.parts using gin (name gin_trgm_ops);
create index parts_active_category_idx on public.parts (category) where is_active;

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_pt text not null,
  name_en text,
  name_es text,
  sort_order integer not null default 0
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  -- agrupa as versões do mesmo texto nos três idiomas
  group_id uuid not null default gen_random_uuid(),
  locale text not null default 'pt' check (locale in ('pt', 'en', 'es')),
  slug text not null,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  category_id uuid references public.categories (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  author_id uuid references auth.users (id) on delete set null,
  legacy_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);

comment on column public.posts.legacy_path is 'Caminho do post no site WordPress, para redirecionar 301 depois da virada.';

create index posts_feed_idx on public.posts (locale, published_at desc)
  where status = 'published';
create index posts_category_idx on public.posts (category_id);
create index posts_group_idx on public.posts (group_id);
create index posts_author_idx on public.posts (author_id);

-- ---------------------------------------------------------------------------
-- Cotações
-- ---------------------------------------------------------------------------

create sequence public.quote_ref_seq;

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default 'AJA-' || to_char(now(), 'YYYY') || '-'
    || lpad(nextval('public.quote_ref_seq')::text, 4, '0'),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  aircraft_model text not null,
  part_condition text not null default 'any'
    check (part_condition in ('new', 'overhauled', 'repaired', 'serviceable', 'any')),
  destination text,
  notes text,
  is_aog boolean not null default false,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'quoted', 'won', 'lost')),
  locale text not null default 'pt' check (locale in ('pt', 'en', 'es')),
  source jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.quotes.source is 'Origem do lead: utm_source, utm_campaign, referrer.';

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  part_id uuid references public.parts (id) on delete set null,
  pn text not null,
  name text,
  quantity integer not null default 1 check (quantity > 0),
  -- true quando a pessoa digitou um PN que não está no catálogo
  is_manual boolean not null default false
);

create index quote_items_quote_idx on public.quote_items (quote_id);
create index quote_items_part_idx on public.quote_items (part_id);
create index quotes_inbox_idx on public.quotes (created_at desc);
create index quotes_aog_idx on public.quotes (created_at desc) where is_aog;

-- ---------------------------------------------------------------------------
-- Conteúdo editável do site (hero, FAQ, depoimentos, contatos)
-- ---------------------------------------------------------------------------

create table public.site_content (
  key text not null,
  locale text not null check (locale in ('pt', 'en', 'es')),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  primary key (key, locale)
);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger parts_touch before update on public.parts
  for each row execute function public.touch_updated_at();
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();
create trigger quotes_touch before update on public.quotes
  for each row execute function public.touch_updated_at();
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.parts enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.site_content enable row level security;

-- Perfis: cada um lê o seu; admin administra todos.
create policy profiles_self_select on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_admin_all on public.profiles
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Catálogo: leitura pública do que está ativo; escrita só da equipe.
create policy parts_public_select on public.parts
  for select to anon, authenticated using (is_active);
create policy parts_staff_write on public.parts
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Blog: leitura pública do que está publicado.
create policy categories_public_select on public.categories
  for select to anon, authenticated using (true);
create policy categories_staff_write on public.categories
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy posts_public_select on public.posts
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy posts_staff_all on public.posts
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Cotações: qualquer visitante cria, ninguém de fora lê.
create policy quotes_public_insert on public.quotes
  for insert to anon, authenticated with check (true);
create policy quotes_staff_select on public.quotes
  for select to authenticated using ((select public.is_staff()));
create policy quotes_staff_update on public.quotes
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy quotes_admin_delete on public.quotes
  for delete to authenticated using ((select public.is_admin()));

create policy quote_items_public_insert on public.quote_items
  for insert to anon, authenticated with check (true);
create policy quote_items_staff_select on public.quote_items
  for select to authenticated using ((select public.is_staff()));
create policy quote_items_staff_write on public.quote_items
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Conteúdo do site: leitura pública, escrita da equipe.
create policy site_content_public_select on public.site_content
  for select to anon, authenticated using (true);
create policy site_content_staff_write on public.site_content
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
