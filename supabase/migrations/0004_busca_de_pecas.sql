-- Part number não tem forma canônica: o mesmo item aparece como
-- 4004508-0001, 4004508 0001, 4004508/0001 ou 40045080001, conforme quem
-- digitou. Guardar a forma sem pontuação ao lado da original deixa a busca
-- casar todas elas sem obrigar o visitante a adivinhar o formato.
alter table public.parts
  add column if not exists pn_norm text
  generated always as (upper(regexp_replace(pn, '[^A-Za-z0-9]', '', 'g'))) stored;

create index if not exists parts_pn_norm_idx on public.parts (pn_norm);
create index if not exists parts_pn_norm_trgm_idx
  on public.parts using gin (pn_norm gin_trgm_ops);

-- O que o site não soube responder. É a lista de compras do catálogo:
-- cada linha aqui é alguém que procurou uma peça e não achou.
create table if not exists public.part_search_misses (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  term_norm text not null,
  locale text not null default 'pt',
  created_at timestamptz not null default now()
);

create index if not exists part_search_misses_norm_idx
  on public.part_search_misses (term_norm);
create index if not exists part_search_misses_data_idx
  on public.part_search_misses (created_at desc);

alter table public.part_search_misses enable row level security;

drop policy if exists part_search_misses_staff_select on public.part_search_misses;
create policy part_search_misses_staff_select
  on public.part_search_misses for select
  to authenticated
  using ((select is_staff()));

/**
 * A busca da home e da cotação.
 *
 * Vive no banco por dois motivos. O primeiro é a ordem: casamento exato do
 * part number tem que vir antes de "contém", senão quem digita o número
 * inteiro recebe primeiro um vizinho qualquer. Isso é `order by` com
 * `case`, que o PostgREST não expressa.
 *
 * O segundo é o registro: quando a busca não acha nada, a função anota o
 * termo. Fazer isso aqui garante que toda busca sem resultado seja contada,
 * em vez de depender de o navegador lembrar de avisar.
 */
create or replace function public.buscar_pecas(
  p_termo text,
  p_locale text default 'pt',
  p_limite int default 8
)
returns table (
  id uuid,
  pn text,
  name text,
  description text,
  manufacturer text,
  category text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_termo text := btrim(coalesce(p_termo, ''));
  v_norm text := upper(regexp_replace(v_termo, '[^A-Za-z0-9]', '', 'g'));
  v_limite int := greatest(1, least(20, coalesce(p_limite, 8)));
  v_achou int;
begin
  if length(v_termo) < 2 then
    return;
  end if;

  return query
  select p.id, p.pn, p.name, p.description, p.manufacturer, p.category
    from public.parts p
   where p.is_active
     and (
       (v_norm <> '' and p.pn_norm like '%' || v_norm || '%')
       or p.name ilike '%' || v_termo || '%'
       or p.description ilike '%' || v_termo || '%'
     )
   order by
     case
       when v_norm <> '' and p.pn_norm = v_norm then 0
       when v_norm <> '' and p.pn_norm like v_norm || '%' then 1
       when v_norm <> '' and p.pn_norm like '%' || v_norm || '%' then 2
       when p.name ilike v_termo || '%' then 3
       else 4
     end,
     length(p.pn),
     p.pn
   limit v_limite;

  get diagnostics v_achou = row_count;

  if v_achou = 0 then
    insert into public.part_search_misses (term, term_norm, locale)
    values (
      left(v_termo, 120),
      left(v_norm, 120),
      case when p_locale in ('pt', 'en', 'es') then p_locale else 'pt' end
    );
  end if;
end;
$$;

revoke all on function public.buscar_pecas(text, text, int) from public;
grant execute on function public.buscar_pecas(text, text, int) to anon, authenticated;
