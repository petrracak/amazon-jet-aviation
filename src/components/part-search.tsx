'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  MagnifyingGlass,
  Plus,
  Warning,
} from '@phosphor-icons/react';
import { Link } from '@/i18n/navigation';
import { PecaIdentificada } from '@/components/peca-identificada';
import { useBuscaPecas } from '@/lib/use-busca-pecas';

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

  const [termo, setTermo] = useState('');
  const { resultados, estado, identificacao, identificando } = useBuscaPecas(termo, 6);

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

      <p className="mt-3 text-sm text-mist-soft">{t('searchHint')}</p>

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

        {resultados && resultados.length > 0 ? (
          <Link
            href={{ pathname: '/cotacao', query: { pn: limpo } }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-mist-soft underline-offset-4 transition-colors hover:text-tag hover:underline"
          >
            {ts('alsoAsk', { pn: limpo })}
            <ArrowRight size={14} weight="bold" />
          </Link>
        ) : null}

        {resultados && resultados.length === 0 ? (
          <div className="rounded-md border-l-[3px] border-tag bg-tag/10 px-4 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <CheckCircle size={18} weight="fill" className="shrink-0 text-tag" />
              {ts('emptyTitle')}
            </p>
            <p className="measure mt-1.5 text-sm text-mist-soft">{ts('empty')}</p>
            <Link
              href={{ pathname: '/cotacao', query: { pn: limpo } }}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-tag px-4 py-2 text-sm font-semibold text-night transition-transform hover:-translate-y-0.5"
            >
              {ts('emptyAction', { pn: limpo })}
              <ArrowRight size={16} weight="bold" />
            </Link>

            {identificando ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-mist-soft">
                <CircleNotch size={14} className="animate-spin text-tag" />
                {ts('identifying')}
              </p>
            ) : null}
            {identificacao ? <PecaIdentificada identificacao={identificacao} ns="search" /> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
