-- O que a identificação por IA respondeu para cada part number.
--
-- Guardar não é só economia de chamada: o modelo responde diferente para o
-- mesmo PN de uma vez para outra — no teste, 4004508-0001 voltou ora como
-- filtro de combustível de 737, ora como conjunto de freio de Bonanza. Sem
-- guardar a primeira resposta, dois visitantes com o mesmo part number
-- veriam peças diferentes, e a equipe não teria como saber o que o site
-- andou dizendo.
--
-- Guardado, o palpite vira material de trabalho: a equipe revisa no painel
-- e promove para o catálogo o que estiver certo.
create table if not exists public.part_identifications (
  pn_norm text primary key,
  pn text not null,
  name text,
  manufacturer text,
  category text,
  aircraft text,
  confidence int,
  origem text not null default 'worker',
  revisada boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists part_identifications_data_idx
  on public.part_identifications (created_at desc);

alter table public.part_identifications enable row level security;

drop policy if exists part_identifications_staff_select on public.part_identifications;
create policy part_identifications_staff_select
  on public.part_identifications for select
  to authenticated
  using ((select is_staff()));

drop policy if exists part_identifications_staff_write on public.part_identifications;
create policy part_identifications_staff_write
  on public.part_identifications for update
  to authenticated
  using ((select is_staff()))
  with check ((select is_staff()));

/** Devolve a identificação já guardada, se houver. */
create or replace function public.identificacao_guardada(p_pn_norm text)
returns table (pn text, name text, manufacturer text, category text, aircraft text)
language sql
security definer
set search_path = public
stable
as $$
  select i.pn, i.name, i.manufacturer, i.category, i.aircraft
    from public.part_identifications i
   where i.pn_norm = upper(regexp_replace(coalesce(p_pn_norm, ''), '[^A-Za-z0-9]', '', 'g'))
     and i.name is not null;
$$;

/**
 * Guarda a primeira identificação de um part number.
 *
 * `on conflict do nothing` de propósito: a primeira resposta é a que vale.
 * Sobrescrever a cada chamada traria de volta justamente a instabilidade
 * que esta tabela existe para conter.
 */
create or replace function public.guardar_identificacao(
  p_pn text,
  p_name text,
  p_manufacturer text,
  p_category text,
  p_aircraft text,
  p_confidence int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_norm text := upper(regexp_replace(coalesce(p_pn, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if length(v_norm) < 3 or coalesce(trim(p_name), '') = '' then
    return;
  end if;

  insert into public.part_identifications
    (pn_norm, pn, name, manufacturer, category, aircraft, confidence)
  values (
    v_norm,
    left(trim(p_pn), 80),
    left(trim(p_name), 200),
    nullif(left(trim(coalesce(p_manufacturer, '')), 160), ''),
    nullif(left(trim(coalesce(p_category, '')), 80), ''),
    nullif(left(trim(coalesce(p_aircraft, '')), 200), ''),
    p_confidence
  )
  on conflict (pn_norm) do nothing;
end;
$$;

revoke all on function public.identificacao_guardada(text) from public;
revoke all on function public.guardar_identificacao(text, text, text, text, text, int) from public;
grant execute on function public.identificacao_guardada(text) to anon, authenticated;
grant execute on function public.guardar_identificacao(text, text, text, text, text, int) to anon, authenticated;
