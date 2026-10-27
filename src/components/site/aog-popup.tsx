'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Lightning, X } from '@phosphor-icons/react';

const CHAVE = 'aja-aog-visto';
const UM_DIA = 24 * 60 * 60 * 1000;

/**
 * Pergunta de entrada: aeronave no solo ou não.
 *
 * Aparece só na home, 1,2s depois da página abrir, e no máximo uma vez a
 * cada 24 horas por pessoa. Quem já respondeu não é interrompido de novo.
 *
 * O localStorage pode falhar em aba anônima, então toda leitura e escrita
 * é protegida: no pior caso o aviso aparece de novo, nunca quebra a página.
 */
export function AogPopup({ aogHref }: { aogHref: string }) {
  const t = useTranslations('aogPopup');
  const [aberto, setAberto] = useState(false);
  const fecharRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let visto = 0;
    try {
      visto = Number(localStorage.getItem(CHAVE) ?? 0);
    } catch {
      visto = 0;
    }

    if (Date.now() - visto < UM_DIA) return;

    const timer = setTimeout(() => setAberto(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!aberto) return;

    fecharRef.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    window.addEventListener('keydown', tecla);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
    };
  }, [aberto]);

  function fechar() {
    setAberto(false);
    try {
      localStorage.setItem(CHAVE, String(Date.now()));
    } catch {
      // Aba anônima: segue sem marcar.
    }
  }

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aog-popup-titulo"
      className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('close')}
        onClick={fechar}
        className="absolute inset-0 animate-[aparecer_0.3s_ease-out_both] bg-night/80 backdrop-blur-sm"
      />

      <div className="glass relative w-full max-w-lg animate-[subir_0.45s_var(--ease-out-soft)_both] rounded-xl p-6 sm:p-8">
        <button
          ref={fecharRef}
          type="button"
          onClick={fechar}
          aria-label={t('close')}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-mist-soft transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} weight="bold" />
        </button>

        <span className="grid size-12 place-items-center rounded-lg bg-aog/15 text-aog">
          <Lightning size={26} weight="fill" />
        </span>

        <h2
          id="aog-popup-titulo"
          className="mt-5 font-display text-[1.6rem] leading-tight text-white"
        >
          {t('title')}
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-mist-soft">{t('text')}</p>

        <div className="mt-7 grid gap-3">
          <a
            href={aogHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={fechar}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-aog px-6 py-4 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-aog-deep"
          >
            <Lightning size={18} weight="fill" className="transition-transform group-hover:scale-125" />
            {t('urgent')}
          </a>

          <button
            type="button"
            onClick={fechar}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-[0.9375rem] font-medium text-mist transition-colors hover:border-white/50 hover:text-white"
          >
            {t('browse')}
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-mist-soft/75">{t('hours')}</p>
      </div>
    </div>
  );
}
