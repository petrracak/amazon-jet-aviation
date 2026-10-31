-- Grava a cotação e os itens dela numa transação só, e devolve a
-- referência (AJA-2026-0001) para mostrar ao visitante.
--
-- Por que uma função e não dois inserts: quem envia o formulário é
-- anônimo, e anônimo tem permissão de inserir mas não de ler. Sem ler não
-- há como saber o id da cotação para pendurar os itens nela, nem a
-- referência para confirmar na tela. A função roda como dona da tabela,
-- resolve as duas coisas e ainda garante que nunca sobre uma cotação sem
-- itens se algo falhar no meio.
create or replace function public.criar_cotacao(
  p_name text,
  p_email text,
  p_phone text,
  p_company text,
  p_aircraft_model text,
  p_part_condition text,
  p_destination text,
  p_notes text,
  p_is_aog boolean,
  p_locale text,
  p_source jsonb,
  p_items jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_ref text;
  v_item jsonb;
begin
  if coalesce(trim(p_name), '') = ''
     or coalesce(trim(p_email), '') = ''
     or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_aircraft_model), '') = '' then
    raise exception 'DADOS_INCOMPLETOS';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'SEM_ITENS';
  end if;

  -- Teto para não virar porta de entrada de lixo.
  if jsonb_array_length(p_items) > 40 then
    raise exception 'ITENS_DEMAIS';
  end if;

  insert into public.quotes (
    name, email, phone, company, aircraft_model,
    part_condition, destination, notes, is_aog, locale, source
  )
  values (
    left(trim(p_name), 120),
    left(lower(trim(p_email)), 160),
    left(trim(p_phone), 40),
    nullif(left(trim(coalesce(p_company, '')), 120), ''),
    left(trim(p_aircraft_model), 120),
    case
      when p_part_condition in ('new', 'overhauled', 'repaired', 'serviceable', 'any')
        then p_part_condition
      else 'any'
    end,
    nullif(left(trim(coalesce(p_destination, '')), 160), ''),
    nullif(left(trim(coalesce(p_notes, '')), 2000), ''),
    coalesce(p_is_aog, false),
    case when p_locale in ('pt', 'en', 'es') then p_locale else 'pt' end,
    coalesce(p_source, '{}'::jsonb)
  )
  returning id, ref into v_id, v_ref;

  for v_item in select * from jsonb_array_elements(p_items) loop
    if coalesce(trim(v_item->>'pn'), '') = '' then
      continue;
    end if;

    insert into public.quote_items (quote_id, part_id, pn, name, quantity, is_manual)
    values (
      v_id,
      nullif(v_item->>'partId', '')::uuid,
      left(trim(v_item->>'pn'), 80),
      nullif(left(trim(coalesce(v_item->>'name', '')), 200), ''),
      greatest(1, least(999, coalesce((v_item->>'quantity')::int, 1))),
      coalesce((v_item->>'isManual')::boolean, false)
    );
  end loop;

  return v_ref;
end;
$$;

revoke all on function public.criar_cotacao(
  text, text, text, text, text, text, text, text, boolean, text, jsonb, jsonb
) from public;

grant execute on function public.criar_cotacao(
  text, text, text, text, text, text, text, text, boolean, text, jsonb, jsonb
) to anon, authenticated;
