-- Painel de administração: perfis completos, configurações do site,
-- capa de post no Storage e criação automática de perfil.

alter table public.profiles
  add column if not exists email text,
  add column if not exists ativo boolean not null default true,
  add column if not exists avatar_url text;

-- Guardamos o caminho no Storage para poder apagar o arquivo junto do post.
alter table public.posts
  add column if not exists cover_image_path text;

-- Configurações que o painel edita: contato, pixels e mensagens dos botões.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

comment on table public.site_settings is 'Ajustes do site editáveis pelo painel. Leitura pública, escrita só da equipe.';

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

create policy site_settings_public_select on public.site_settings
  for select to anon, authenticated using (true);
create policy site_settings_staff_write on public.site_settings
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Toda conta criada no Auth ganha um perfil. A primeira vira administradora,
-- senão ninguém conseguiria promover ninguém.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  primeira boolean;
begin
  select not exists (select 1 from public.profiles) into primeira;

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    case when primeira then 'admin' else 'editor' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Buckets: capas do blog e fotos de perfil. Leitura pública, escrita da equipe.
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true), ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy blog_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'blog');
create policy blog_staff_write on storage.objects
  for insert to authenticated with check (bucket_id = 'blog' and (select public.is_staff()));
create policy blog_staff_update on storage.objects
  for update to authenticated using (bucket_id = 'blog' and (select public.is_staff()));
create policy blog_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'blog' and (select public.is_staff()));

create policy avatars_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'avatars');
create policy avatars_staff_write on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars' and (select public.is_staff()));
create policy avatars_staff_update on storage.objects
  for update to authenticated using (bucket_id = 'avatars' and (select public.is_staff()));
create policy avatars_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'avatars' and (select public.is_staff()));

-- Valores iniciais, tirados da copy aprovada.
insert into public.site_settings (key, value) values
  ('contato', jsonb_build_object(
     'whatsapp', '19547784501',
     'telefone_exibicao', '+1 (954) 778-4501',
     'email', 'commercial@amazonjetaviation.com',
     'instagram', 'https://instagram.com/amazon.jet.aviation',
     'horario', 'Segunda a sexta, das 9h às 17h (horário da Flórida)',
     'endereco_miami', '200 S Biscayne Blvd, Suite 20-107, Miami, FL 33131, Estados Unidos',
     'endereco_deerfield', '455 Fairway Drive, Suite 214, Deerfield Beach, FL 33441, Estados Unidos'
   )),
  ('pixels', jsonb_build_object(
     'meta_pixel_id', '', 'ga4_id', '', 'gtm_id', '', 'google_ads_id', ''
   )),
  ('mensagens', jsonb_build_object(
     'whatsapp_padrao', 'Olá! Vim pelo site e quero pedir uma cotação de peças.',
     'whatsapp_aog', 'AOG - Aeronave no solo. Preciso de atendimento prioritário.'
   ))
on conflict (key) do nothing;
