'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Part } from '@/lib/types';

const EXAMPLES = ['LW-12417', 'REM40E', 'GTX-345'];

export function PartSearch() {
  const t = useTranslations('hero');
  const ts = useTranslations('search');
  const inputId = useId();

  const supabase = useMemo(() => createClient(), []);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Part[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const requestRef = useRef(0);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setResults(null);
      setStatus('idle');
      return;
    }

    const ticket = ++requestRef.current;
    setStatus('loading');

    const timer = setTimeout(async () => {
      // O índice é trigrama, então ilike com % nas duas pontas usa o índice
      // e encontra o part number mesmo digitado pela metade.
      const pattern = `%${query.replace(/[%_]/g, '')}%`;
      const { data, error } = await supabase
        .from('parts')
        .select('id, pn, name, description, manufacturer, category')
        .or(`pn.ilike.${pattern},name.ilike.${pattern}`)
        .order('pn')
        .limit(8);

      if (ticket !== requestRef.current) return;
      if (error) {
        setStatus('error');
        setResults(null);
        return;
      }
      setStatus('idle');
      setResults(data ?? []);
    }, 220);

    return () => clearTimeout(timer);
  }, [term, supabase]);

  const trimmed = term.trim();

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="sr-only">
        {t('searchLabel')}
      </label>

      {/*
        Sem botão "Pesquisar": a busca responde enquanto a pessoa digita, e um
        botão que não faz nada é uma promessa falsa. A lupa marca o campo.
      */}
      <div className="flex items-center gap-3 border-2 border-ink bg-surface px-4 focus-within:ring-2 focus-within:ring-signal focus-within:ring-offset-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="shrink-0 text-ink-soft"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <input
          id={inputId}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          className="pn min-w-0 flex-1 bg-transparent py-4 text-base outline-none placeholder:font-sans placeholder:text-ink-soft sm:text-lg"
        />
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        {t('searchHint')}{' '}
        {EXAMPLES.map((example, index) => (
          <span key={example}>
            {index > 0 && ', '}
            <button
              type="button"
              onClick={() => setTerm(example)}
              className="pn underline decoration-tag decoration-2 underline-offset-4 hover:text-ink"
            >
              {example}
            </button>
          </span>
        ))}
      </p>

      <div aria-live="polite" className="mt-5">
        {status === 'loading' && trimmed.length >= 2 && (
          <p className="text-sm text-ink-soft">{ts('searching')}</p>
        )}

        {status === 'error' && (
          <p className="text-sm text-aog">{ts('error')}</p>
        )}

        {results && results.length > 0 && (
          <>
            <p className="sr-only">
              {results.length === 1
                ? ts('resultsOne')
                : ts('resultsOther', { count: results.length })}
            </p>
            <ul className="divide-y divide-mist-deep border border-mist-deep bg-surface">
              {results.map((part) => (
                <li
                  key={part.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                >
                  <span className="pn w-32 shrink-0 font-medium">{part.pn}</span>
                  <span className="min-w-0 flex-1 text-sm">
                    {part.name}
                    {part.manufacturer && (
                      <span className="block text-xs text-ink-soft">
                        {part.manufacturer}
                      </span>
                    )}
                  </span>
                  <Link
                    href={{ pathname: '/cotacao', query: { pn: part.pn } }}
                    className="shrink-0 border border-ink px-3 py-1.5 text-sm font-medium transition-colors hover:bg-ink hover:text-surface"
                  >
                    {ts('add')}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {results && results.length === 0 && (
          <div className="border-l-4 border-tag bg-tag-soft px-4 py-4">
            <p className="measure text-sm text-ink">{ts('empty')}</p>
            <Link
              href={{ pathname: '/cotacao', query: { pn: trimmed } }}
              className="mt-3 inline-block bg-ink px-4 py-2 text-sm font-semibold text-surface"
            >
              {ts('emptyAction', { pn: trimmed })}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
