'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Lightning,
  MagnifyingGlass,
  Minus,
  Plus,
  Trash,
  Warning,
  WhatsappLogo,
} from '@phosphor-icons/react';

import { enviarCotacao, type ItemCotacao } from '@/app/actions/cotacao';
import { Link } from '@/i18n/navigation';
import { whatsappUrl } from '@/lib/contact';
import { createClient } from '@/lib/supabase/client';
import { useBuscaPecas } from '@/lib/use-busca-pecas';
import { cn } from '@/lib/utils';
import type { Part } from '@/lib/types';

/**
 * O formulário de cotação: busca a peça, monta a lista e envia.
 *
 * Três etapas numeradas numa coluna só, na ordem em que a pessoa pensa —
 * primeiro o que ela precisa, depois quanto, depois quem é ela. O carrinho
 * fica no meio justamente para ela ver o que já pediu antes de começar a
 * digitar os próprios dados.
 *
 * A busca é a mesma do hero, mas aqui ela acrescenta à lista em vez de
 * navegar. Part number que não está no catálogo entra assim mesmo, marcado
 * como manual: o catálogo é um atalho, não uma porteira.
 */

const CONDICOES = ['any', 'new', 'overhauled', 'repaired', 'serviceable'] as const;

const VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  aeronave: '',
  condicao: 'any',
  destino: '',
  observacoes: '',
  aog: false,
};

const campo =
  'w-full rounded-lg border border-white/15 bg-white/[0.06] px-4 py-3 text-base text-white ' +
  'outline-none transition-colors placeholder:text-mist-soft/60 focus:border-tag/60 focus:bg-white/[0.1]';

export function FormularioCotacao({
  pnInicial,
  whatsappNumero,
  textoPadrao,
  textoAog,
}: {
  pnInicial?: string;
  whatsappNumero: string;
  textoPadrao: string;
  textoAog: string;
}) {
  const t = useTranslations('quote');
  const locale = useLocale();
  const supabase = useMemo(() => createClient(), []);

  const [itens, setItens] = useState<ItemCotacao[]>([]);
  const [enviado, setEnviado] = useState<{ ref: string; aog: boolean; href: string } | null>(
    null,
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<'campos' | 'itens' | 'envio' | null>(null);

  const [form, setForm] = useState({ ...VAZIO });

  const temItem = (pn: string) =>
    itens.some((item) => item.pn.toLowerCase() === pn.toLowerCase());

  function adicionar(peca: Part) {
    if (temItem(peca.pn)) return;
    setItens((atual) => [
      ...atual,
      { pn: peca.pn, name: peca.name, quantity: 1, partId: peca.id, isManual: false },
    ]);
    setErro(null);
  }

  function adicionarManual(pn: string) {
    const limpo = pn.trim();
    if (!limpo || temItem(limpo)) return;
    setItens((atual) => [
      ...atual,
      { pn: limpo, name: null, quantity: 1, partId: null, isManual: true },
    ]);
    setErro(null);
  }

  function mudarQuantidade(pn: string, passo: number) {
    setItens((atual) =>
      atual.map((item) =>
        item.pn === pn
          ? { ...item, quantity: Math.max(1, Math.min(999, item.quantity + passo)) }
          : item,
      ),
    );
  }

  function remover(pn: string) {
    setItens((atual) => atual.filter((item) => item.pn !== pn));
  }

  // Quem chega da busca do hero traz o part number na URL: já entra na lista.
  const jaSemeou = useRef(false);
  useEffect(() => {
    const pn = pnInicial?.trim();
    if (!pn || jaSemeou.current) return;
    jaSemeou.current = true;

    let cancelado = false;
    supabase
      .from('parts')
      .select('id, pn, name, description, manufacturer, category')
      .ilike('pn', pn)
      .limit(1)
      .then(({ data }) => {
        if (cancelado) return;
        const achada = data?.[0] as Part | undefined;
        if (achada) adicionar(achada);
        else adicionarManual(pn);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pnInicial, supabase]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (enviando) return;

    if (itens.length === 0) {
      setErro('itens');
      return;
    }

    setEnviando(true);
    setErro(null);

    const resposta = await enviarCotacao({
      ...form,
      locale,
      origem: pnInicial ? 'busca' : 'direto',
      itens,
    });

    setEnviando(false);
    if (!resposta.ok) {
      setErro(resposta.erro);
      return;
    }

    // O botão de WhatsApp da confirmação já sai com a cotação escrita:
    // quem acabou de preencher o formulário não vai digitar tudo de novo,
    // e do outro lado a conversa começa com o pedido na frente.
    const resumo = [
      form.aog ? textoAog : textoPadrao,
      '',
      t('successRef', { ref: resposta.ref }),
      `${t('aircraftLabel')}: ${form.aeronave.trim()}`,
      `${t('partsLabel')}: ${itens.map((i) => `${i.quantity}x ${i.pn}`).join(', ')}`,
      form.destino.trim() ? `${t('destinationLabel')}: ${form.destino.trim()}` : null,
    ]
      .filter((linha) => linha !== null)
      .join('\n');

    setEnviado({
      ref: resposta.ref,
      aog: form.aog,
      href: whatsappUrl(whatsappNumero, resumo),
    });
  }

  if (enviado) {
    return (
      <Confirmacao
        ref_={enviado.ref}
        aog={enviado.aog}
        whatsappHref={enviado.href}
        aoRecomecar={() => {
          setItens([]);
          setForm({ ...VAZIO });
          setEnviado(null);
          jaSemeou.current = true;
        }}
      />
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-8">
      <Etapa numero={1} titulo={t('searchStep')}>
        <BuscaPeca aoAdicionar={adicionar} aoAdicionarManual={adicionarManual} temItem={temItem} />
      </Etapa>

      <Etapa
        numero={2}
        titulo={t('cartStep')}
        selo={t('cartCount', { count: itens.length })}
      >
        {itens.length === 0 ? (
          <p className="text-sm text-mist-soft">{t('cartEmpty')}</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {itens.map((item) => (
              <li key={item.pn} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="pn text-sm font-medium text-tag">{item.pn}</p>
                  <p className="truncate text-sm text-mist-soft">
                    {item.name ?? t('manual')}
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
                  <BotaoQuantidade
                    rotulo={t('less')}
                    aoClicar={() => mudarQuantidade(item.pn, -1)}
                    desabilitado={item.quantity <= 1}
                  >
                    <Minus size={14} weight="bold" />
                  </BotaoQuantidade>
                  <span
                    aria-label={t('quantity')}
                    className="pn w-8 text-center text-sm text-white"
                  >
                    {item.quantity}
                  </span>
                  <BotaoQuantidade
                    rotulo={t('more')}
                    aoClicar={() => mudarQuantidade(item.pn, 1)}
                  >
                    <Plus size={14} weight="bold" />
                  </BotaoQuantidade>
                </div>

                <button
                  type="button"
                  onClick={() => remover(item.pn)}
                  aria-label={`${t('remove')}: ${item.pn}`}
                  className="grid size-9 place-items-center rounded-full text-mist-soft transition-colors hover:bg-aog/15 hover:text-aog"
                >
                  <Trash size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Etapa>

      <Etapa numero={3} titulo={t('dataStep')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo={t('name')} obrigatorio>
            <input
              required
              autoComplete="name"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className={campo}
            />
          </Campo>

          <Campo rotulo={t('email')} obrigatorio>
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={campo}
            />
          </Campo>

          <Campo rotulo={t('phone')} obrigatorio>
            <input
              required
              type="tel"
              autoComplete="tel"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className={campo}
            />
          </Campo>

          <Campo rotulo={t('company')}>
            <input
              autoComplete="organization"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              className={campo}
            />
          </Campo>

          <Campo rotulo={t('aircraft')} obrigatorio>
            <input
              required
              value={form.aeronave}
              placeholder={t('aircraftPlaceholder')}
              onChange={(e) => setForm({ ...form, aeronave: e.target.value })}
              className={campo}
            />
          </Campo>

          <Campo rotulo={t('condition')}>
            <select
              value={form.condicao}
              onChange={(e) => setForm({ ...form, condicao: e.target.value })}
              className={cn(campo, 'appearance-none bg-night-2')}
            >
              {CONDICOES.map((c) => (
                <option key={c} value={c} className="bg-night-2">
                  {t(
                    `condition${c.charAt(0).toUpperCase()}${c.slice(1)}` as
                      | 'conditionAny'
                      | 'conditionNew'
                      | 'conditionOverhauled'
                      | 'conditionRepaired'
                      | 'conditionServiceable',
                  )}
                </option>
              ))}
            </select>
          </Campo>

          <Campo rotulo={t('destination')} className="sm:col-span-2">
            <input
              value={form.destino}
              placeholder={t('destinationPlaceholder')}
              onChange={(e) => setForm({ ...form, destino: e.target.value })}
              className={campo}
            />
          </Campo>

          <Campo rotulo={t('notes')} className="sm:col-span-2">
            <textarea
              rows={4}
              value={form.observacoes}
              placeholder={t('notesPlaceholder')}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              className={cn(campo, 'resize-y')}
            />
          </Campo>
        </div>

        <label
          className={cn(
            'mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
            form.aog
              ? 'border-aog bg-aog/12'
              : 'border-white/12 bg-white/[0.04] hover:border-aog/50',
          )}
        >
          <input
            type="checkbox"
            checked={form.aog}
            onChange={(e) => setForm({ ...form, aog: e.target.checked })}
            className="mt-1 size-4 accent-[#e02430]"
          />
          <span className="min-w-0">
            <span className="flex items-center gap-2 font-medium text-white">
              <Lightning size={18} weight="fill" className="text-aog" />
              {t('aogTitle')}
            </span>
            <span className="mt-1 block text-sm text-mist-soft">{t('aogText')}</span>
          </span>
        </label>
      </Etapa>

      {erro ? (
        <p role="alert" className="flex items-start gap-2 text-sm text-aog">
          <Warning size={18} weight="fill" className="mt-0.5 shrink-0" />
          {t(erro === 'itens' ? 'errorEmpty' : erro === 'campos' ? 'errorFields' : 'errorSend')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-full px-6 py-4',
          'text-base font-semibold transition-transform disabled:opacity-60',
          form.aog ? 'pulso-aog bg-aog text-white' : 'bg-tag text-night',
          !enviando && 'hover:-translate-y-0.5',
        )}
      >
        {enviando ? (
          <CircleNotch size={20} className="animate-spin" />
        ) : (
          <ArrowRight size={20} weight="bold" />
        )}
        {enviando ? t('sending') : t('submit')}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------ a busca */

function BuscaPeca({
  aoAdicionar,
  aoAdicionarManual,
  temItem,
}: {
  aoAdicionar: (peca: Part) => void;
  aoAdicionarManual: (pn: string) => void;
  temItem: (pn: string) => boolean;
}) {
  const t = useTranslations('quote');
  const inputId = useId();

  const [termo, setTermo] = useState('');
  const { resultados, estado } = useBuscaPecas(termo, 8);

  const limpo = termo.trim();

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-mist">
        {t('searchLabel')}
      </label>

      <div className="group relative mt-2 flex items-center gap-3 rounded-lg border border-white/15 bg-white/[0.06] px-4 transition-colors focus-within:border-tag/60 focus-within:bg-white/[0.1]">
        <MagnifyingGlass
          size={20}
          className="shrink-0 text-mist-soft transition-colors group-focus-within:text-tag"
        />
        <input
          id={inputId}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder={t('searchPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          className="pn min-w-0 flex-1 bg-transparent py-3.5 text-base text-white outline-none placeholder:font-sans placeholder:text-mist-soft/60"
        />
        {estado === 'buscando' ? (
          <CircleNotch size={20} className="shrink-0 animate-spin text-tag" />
        ) : null}
      </div>

      <p className="mt-2 text-sm text-mist-soft">{t('searchHint')}</p>

      <div aria-live="polite" className="mt-4">
        {estado === 'erro' ? (
          <p className="flex items-center gap-2 text-sm text-aog">
            <Warning size={18} weight="fill" />
            {t('searchError')}
          </p>
        ) : null}

        {resultados && resultados.length > 0 ? (
          <ul className="divide-y divide-white/10 overflow-hidden rounded-lg border border-white/12 bg-night-2/70">
            {resultados.map((peca) => {
              const dentro = temItem(peca.pn);
              return (
                <li key={peca.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="pn block text-sm font-medium text-tag">{peca.pn}</span>
                    <span className="block truncate text-sm text-white">{peca.name}</span>
                    {peca.manufacturer ? (
                      <span className="block truncate text-xs text-mist-soft">
                        {peca.manufacturer}
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => aoAdicionar(peca)}
                    disabled={dentro}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors',
                      dentro
                        ? 'bg-white/8 text-mist-soft'
                        : 'bg-tag/15 text-tag hover:bg-tag hover:text-night',
                    )}
                  >
                    {dentro ? <CheckCircle size={14} weight="fill" /> : <Plus size={14} weight="bold" />}
                    <span className="hidden sm:inline">{dentro ? t('added') : t('add')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {resultados && resultados.length > 0 && !temItem(limpo) ? (
          <button
            type="button"
            onClick={() => {
              aoAdicionarManual(limpo);
              setTermo('');
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-mist-soft underline-offset-4 transition-colors hover:text-tag hover:underline"
          >
            <Plus size={14} weight="bold" />
            {t('alsoAdd', { pn: limpo })}
          </button>
        ) : null}

        {resultados && resultados.length === 0 ? (
          <div className="rounded-lg border-l-[3px] border-tag bg-tag/10 px-4 py-4">
            <p className="measure text-sm text-mist">{t('notFound')}</p>

            <button
              type="button"
              onClick={() => {
                aoAdicionarManual(limpo);
                setTermo('');
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-tag px-4 py-2 text-sm font-semibold text-night transition-transform hover:-translate-y-0.5"
            >
              <Plus size={16} weight="bold" />
              {t('addManual', { pn: limpo })}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- miudezas */

function Etapa({
  numero,
  titulo,
  selo,
  children,
}: {
  numero: number;
  titulo: string;
  selo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-5 sm:p-7">
      <h2 className="flex flex-wrap items-center gap-3">
        <span className="pn grid size-8 shrink-0 place-items-center rounded-full bg-tag/15 text-sm font-semibold text-tag">
          {numero}
        </span>
        <span className="font-display text-xl text-white sm:text-2xl">{titulo}</span>
        {selo ? (
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-mist-soft">
            {selo}
          </span>
        ) : null}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Campo({
  rotulo,
  obrigatorio = false,
  className,
  children,
}: {
  rotulo: string;
  obrigatorio?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations('quote');
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-sm font-medium text-mist">
        {rotulo}
        {obrigatorio ? (
          <span aria-hidden className="ml-1 text-tag">
            *
          </span>
        ) : (
          <span className="ml-1 font-normal text-mist-soft">({t('optional')})</span>
        )}
      </span>
      {children}
    </label>
  );
}

function BotaoQuantidade({
  rotulo,
  aoClicar,
  desabilitado = false,
  children,
}: {
  rotulo: string;
  aoClicar: () => void;
  desabilitado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={desabilitado}
      aria-label={rotulo}
      className="grid size-7 place-items-center rounded-full text-mist transition-colors hover:bg-white/10 disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function Confirmacao({
  ref_,
  aog,
  whatsappHref,
  aoRecomecar,
}: {
  ref_: string;
  aog: boolean;
  whatsappHref: string;
  aoRecomecar: () => void;
}) {
  const t = useTranslations('quote');
  return (
    <div className="glass rounded-2xl p-7 text-center sm:p-10">
      <span
        className={cn(
          'mx-auto grid size-16 place-items-center rounded-full',
          aog ? 'bg-aog/15 text-aog' : 'bg-tag/15 text-tag',
        )}
      >
        {aog ? <Lightning size={32} weight="fill" /> : <CheckCircle size={32} weight="fill" />}
      </span>

      <h2 className="mt-6 font-display text-3xl text-white">{t('successTitle')}</h2>
      <p className="pn mt-3 text-sm font-medium text-tag">{t('successRef', { ref: ref_ })}</p>
      <p className="measure mx-auto mt-4 text-base leading-relaxed text-mist-soft">
        {aog ? t('successAog') : t('successText')}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5',
            aog ? 'bg-aog text-white' : 'bg-tag text-night',
          )}
        >
          <WhatsappLogo size={18} weight="fill" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={aoRecomecar}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-mist transition-colors hover:border-white/50 hover:text-white"
        >
          {t('successAgain')}
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-2 py-3 text-sm text-mist-soft transition-colors hover:text-white"
        >
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
