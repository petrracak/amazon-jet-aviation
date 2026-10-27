'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  CircleNotch,
  MagnifyingGlass,
  Plus,
  Warning,
} from '@phosphor-icons/react';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Part } from '@/lib/types';

const EXEMPLOS = ['LW-12417', 'REM40E', 'GTX-345'];

/**
 * A busca por part number, que é a ação principal do site.
 *
 * Vive dentro do painel de vidro do hero: o campo é translúcido e o
 * resultado abre logo abaixo, sem empurrar o resto da página.
 */
export function PartSearch({ compacto = false }: { compacto?: boolean }) {
  const t = useTranslations('hero');
  const ts = useTranslations('search');
  const inputId = useId();

  const supabase = useMemo(() => createClient(), []);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Part[] | null>(null);
  const [estado, setEstado] = useState<'parado' | 'buscando' | 'erro'>('parado');
  const pedido = useRef(0);

  useEffect(() => {
    const consulta = termo.trim();
    if (consulta.length < 2) {
      setResultados(null);
      setEstado('parado');
      return;
    }

    const senha = ++pedido.current;
    setEstado('buscando');

    const timer = setTimeout(async () => {
      // O índice é trigrama, então ilike com % nas duas pontas usa o índice
      // e encontra o part number mesmo digitado pela metade.
      const padrao = `%${consulta.replace(/[%_]/g, '')}%`;
      const { data, error } = await supabase
        .from('parts')
        .select('id, pn, name, description, manufacturer, category')
        .or(`pn.ilike.${padrao},name.ilike.${padrao}`)
        .order('pn')
        .limit(6);

      if (senha !== pedido.current) return;
      if (error) {
        setEstado('erro');
        setResultados(null);
        return;
      }
      setEstado('parado');
      setResultados(data ?? []);
    }, 220);

    return () => clearTimeout(timer);
  }, [termo, supabase]);

  const limpo = termo.trim();

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 text-sm font-medium text-mist-soft"
      >
        <MagnifyingGlass size={16} weight="bold" className="text-tag" />
        {t('searchLabel')}
      </label>

      <div className="group relative mt-2.5 flex items-center gap-3 rounded-md border border-white/15 bg-white/[0.07] px-4 transition-colors focus-within:border-tag/60 focus-within:bg-white/[0.11]">
        <MagnifyingGlass
          size={20}
          weight="regular"
          className="shrink-0 text-mist-soft transition-colors group-focus-within:text-tag"
        />
        <input
          id={inputId}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          className="pn min-w-0 flex-1 bg-transparent py-4 text-base text-white outline-none placeholder:font-sans placeholder:text-mist-soft/70 sm:text-lg"
        />
        {estado === 'buscando' ? (
          <CircleNotch size={20} className="shrink-0 animate-spin text-tag" />
        ) : null}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mist-soft">
        {t('searchHint')}
        {EXEMPLOS.map((exemplo) => (
          <button
            key={exemplo}
            type="button"
            onClick={() => setTermo(exemplo)}
            className="pn rounded-sm border border-white/15 bg-white/5 px-2 py-1 text-xs text-mist transition-all hover:-translate-y-0.5 hover:border-tag/60 hover:text-tag"
          >
            {exemplo}
          </button>
        ))}
      </p>

      <div aria-live="polite" className={compacto ? 'mt-4' : 'mt-4'}>
        {estado === 'erro' ? (
          <p className="flex items-center gap-2 text-sm text-aog">
            <Warning size={18} weight="fill" />
            {ts('error')}
          </p>
        ) : null}

        {resultados && resultados.length > 0 ? (
          <ul className="divide-y divide-white/10 overflow-hidden rounded-md border border-white/12 bg-night-2/80 backdrop-blur-xl">
            {resultados.map((peca) => (
              <li key={peca.id}>
                <Link
                  href={{ pathname: '/cotacao', query: { pn: peca.pn } }}
                  className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.06]"
                >
                  <span className="pn w-32 shrink-0 text-sm font-medium text-tag">
                    {peca.pn}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white">{peca.name}</span>
                    {peca.manufacturer ? (
                      <span className="block truncate text-xs text-mist-soft">
                        {peca.manufacturer}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-mist-soft transition-colors group-hover:text-tag">
                    <Plus size={14} weight="bold" />
                    <span className="hidden sm:inline">{ts('add')}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {resultados && resultados.length === 0 ? (
          <div className="rounded-md border-l-[3px] border-tag bg-tag/10 px-4 py-4">
            <p className="measure text-sm text-mist">{ts('empty')}</p>
            <Link
              href={{ pathname: '/cotacao', query: { pn: limpo } }}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-tag px-4 py-2 text-sm font-semibold text-night transition-transform hover:-translate-y-0.5"
            >
              {ts('emptyAction', { pn: limpo })}
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
