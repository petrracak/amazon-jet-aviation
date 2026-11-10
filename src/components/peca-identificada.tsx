'use client';

import { useTranslations } from 'next-intl';
import { Airplane, Factory, Info } from '@phosphor-icons/react';

import type { Identificacao } from '@/app/actions/identificar';

/**
 * O que a identificação automática achou que o part number é.
 *
 * O tom é deliberadamente de palpite. A identificação vem de um modelo
 * lendo o padrão do número, e modelo erra: no teste, o mesmo PN voltou ora
 * como filtro de combustível, ora como conjunto de freio. Então aqui não
 * há selo de confiança nem porcentagem — "parece ser" é o que se pode
 * afirmar, e a confirmação acontece na cotação, onde uma pessoa olha.
 *
 * Aparece abaixo do convite para cotar, nunca no lugar dele: a cotação é o
 * caminho, isto é contexto.
 */
export function PecaIdentificada({
  identificacao,
  ns,
}: {
  identificacao: Identificacao;
  ns: 'search' | 'quote';
}) {
  const t = useTranslations(ns);

  return (
    <div className="mt-4 rounded-lg border border-white/12 bg-white/[0.04] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-mist-soft">
        {t('guessTitle')}
      </p>

      <p className="mt-1.5 text-base font-medium text-white">{identificacao.name}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mist-soft">
        {identificacao.manufacturer ? (
          <span className="flex items-center gap-1.5">
            <Factory size={15} weight="duotone" className="text-tag" />
            {identificacao.manufacturer}
          </span>
        ) : null}
        {identificacao.aircraft ? (
          <span className="flex items-center gap-1.5">
            <Airplane size={15} weight="duotone" className="text-tag" />
            {t('guessAircraft', { aviao: identificacao.aircraft })}
          </span>
        ) : null}
      </div>

      <p className="measure mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-mist-soft/80">
        <Info size={14} weight="regular" className="mt-0.5 shrink-0" />
        {t('guessNote')}
      </p>
    </div>
  );
}
