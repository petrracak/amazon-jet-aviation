'use client';

import {
  ChevronRight,
  Ellipsis,
  ExternalLink,
  FileText,
  House,
  KeyRound,
  LogOut,
  Moon,
  Newspaper,
  PenLine,
  Settings,
  Sun,
  UserCircle,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { sair } from '@/app/actions/auth';
import { Avatar } from '@/components/admin/avatar';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

type PerfilCurto = {
  nome: string;
  role: 'admin' | 'editor';
  avatar_url: string | null;
};

type Item = { href: string; rotulo: string; icone: LucideIcon; admin?: boolean };

const PRINCIPAIS: Item[] = [
  { href: '/admin', rotulo: 'Início', icone: House },
  { href: '/admin/cotacoes', rotulo: 'Cotações', icone: FileText },
  { href: '/admin/posts', rotulo: 'Blog', icone: Newspaper },
];

const GESTAO: Item[] = [
  { href: '/admin/equipe', rotulo: 'Equipe', icone: UsersRound, admin: true },
  { href: '/admin/configuracoes', rotulo: 'Configurações', icone: Settings, admin: true },
  { href: '/admin/conta', rotulo: 'Minha conta', icone: UserCircle },
];

const ROTULO_NIVEL = { admin: 'Administrador', editor: 'Editor' } as const;

function ativoEm(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

function Contagem({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    <span
      className={cn(
        'grid h-5 min-w-5 place-items-center rounded-full bg-aog px-1.5 text-[0.6875rem] font-semibold leading-none text-white',
        className,
      )}
      aria-label={`${n} sem resposta`}
    >
      {n > 99 ? '99+' : n}
    </span>
  );
}

/* -------------------------------------------------------- desktop */

function LinkLateral({
  item,
  ativo,
  contagem = 0,
}: {
  item: Item;
  ativo: boolean;
  contagem?: number;
}) {
  return (
    <Link
      href={item.href}
      prefetch
      aria-current={ativo ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] transition-colors',
        ativo
          ? 'bg-accent/10 font-medium text-accent'
          : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
      )}
    >
      <item.icone className="size-5 shrink-0" strokeWidth={1.6} />
      <span className="min-w-0 flex-1 truncate">{item.rotulo}</span>
      <Contagem n={contagem} />
    </Link>
  );
}

function Lateral({
  perfil,
  semResposta,
  pathname,
}: {
  perfil: PerfilCurto;
  semResposta: number;
  pathname: string;
}) {
  const gestao = GESTAO.filter((i) => !i.admin || perfil.role === 'admin');

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border-base bg-bg-elevated lg:flex">
      <div className="px-6 pb-4 pt-7">
        <BrandLogo href="/admin" tamanho="md" tom="auto" />
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {PRINCIPAIS.map((item) => (
            <LinkLateral
              key={item.href}
              item={item}
              ativo={ativoEm(pathname, item.href)}
              contagem={item.href === '/admin/cotacoes' ? semResposta : 0}
            />
          ))}
        </div>

        <div>
          <p className="px-3 pb-2 text-xs text-fg-subtle">Gestão</p>
          <div className="space-y-1">
            {gestao.map((item) => (
              <LinkLateral key={item.href} item={item} ativo={ativoEm(pathname, item.href)} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-border-base p-3">
        <Link
          href="/admin/conta"
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-bg-subtle"
        >
          <Avatar url={perfil.avatar_url} nome={perfil.nome} tamanho="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{perfil.nome}</span>
            <span className="block text-xs text-fg-muted">{ROTULO_NIVEL[perfil.role]}</span>
          </span>
        </Link>

        <div className="mt-2 flex items-center gap-2 px-2">
          <ThemeToggle className="!size-10 shrink-0" />
          <Link
            href="/"
            target="_blank"
            aria-label="Ver o site"
            title="Ver o site"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border-base text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            <ExternalLink className="size-[1.1rem]" strokeWidth={1.5} />
          </Link>
          <form action={sair} className="ml-auto">
            <button
              type="submit"
              className="flex min-h-10 items-center gap-2 rounded-full px-4 text-sm text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
            >
              <LogOut className="size-4" strokeWidth={1.6} />
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

/* --------------------------------------------------------- celular */

function BarraTopo({ perfil }: { perfil: PerfilCurto }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-base bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <BrandLogo href="/admin" tamanho="sm" tom="auto" />
        <Link
          href="/admin/conta"
          aria-label="Minha conta"
          className="grid size-11 place-items-center rounded-full"
        >
          <Avatar url={perfil.avatar_url} nome={perfil.nome} tamanho="sm" />
        </Link>
      </div>
    </header>
  );
}

/**
 * Painel que sobe de baixo. Fechado, fica fora da tela e `inert`: não recebe
 * foco nem leitor de tela. Esc, toque no fundo ou em qualquer opção fecha.
 */
function Folha({
  aberta,
  aoFechar,
  titulo,
  children,
}: {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberta) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aberta, aoFechar]);

  return (
    <div className={cn('fixed inset-0 z-50 lg:hidden', !aberta && 'pointer-events-none')} inert={!aberta}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar"
        onClick={aoFechar}
        className={cn(
          'absolute inset-0 bg-black/55 transition-opacity duration-300 motion-reduce:transition-none',
          aberta ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          'absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-bg-elevated px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl transition-transform duration-300 motion-reduce:transition-none',
          aberta ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border-strong" aria-hidden />
        <p className="px-2 pb-2 font-display text-lg">{titulo}</p>
        {children}
      </div>
    </div>
  );
}

function ItemFolha({
  href,
  icone: Icone,
  rotulo,
  aoEscolher,
  externo,
}: {
  href: string;
  icone: LucideIcon;
  rotulo: string;
  aoEscolher: () => void;
  externo?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={!externo}
      onClick={aoEscolher}
      target={externo ? '_blank' : undefined}
      className="flex min-h-14 items-center gap-4 rounded-2xl px-2 transition-colors active:bg-bg-subtle"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-bg-subtle text-fg">
        <Icone className="size-5" strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1 text-base font-medium">{rotulo}</span>
      <ChevronRight className="size-5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
    </Link>
  );
}

function BotaoTema() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-2 text-left transition-colors active:bg-bg-subtle"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-bg-subtle">
        <Moon className="size-5 dark:hidden" strokeWidth={1.6} />
        <Sun className="hidden size-5 dark:block" strokeWidth={1.6} />
      </span>
      <span className="flex-1 text-base font-medium">
        <span className="dark:hidden">Usar tema escuro</span>
        <span className="hidden dark:inline">Usar tema claro</span>
      </span>
    </button>
  );
}

function AbaInferior({
  perfil,
  semResposta,
  pathname,
}: {
  perfil: PerfilCurto;
  semResposta: number;
  pathname: string;
}) {
  const [folha, setFolha] = useState(false);
  const fechar = () => setFolha(false);

  const gestao = GESTAO.filter((i) => !i.admin || perfil.role === 'admin');
  const naFolha = gestao.some((i) => ativoEm(pathname, i.href));

  const aba = (item: Item, contagem = 0) => {
    const ativo = ativoEm(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch
        aria-current={ativo ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium transition-colors',
          ativo ? 'text-accent' : 'text-fg-muted',
        )}
      >
        <span
          className={cn(
            'relative grid h-8 w-14 place-items-center rounded-full transition-colors',
            ativo && 'bg-accent/12',
          )}
        >
          <item.icone className="size-6" strokeWidth={ativo ? 2 : 1.6} />
          <Contagem n={contagem} className="absolute -right-0.5 -top-0.5 h-4 min-w-4 text-[0.625rem]" />
        </span>
        {item.rotulo}
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-base bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="grid h-16 grid-cols-5">
          {aba(PRINCIPAIS[0])}
          {aba(PRINCIPAIS[1], semResposta)}

          {/* Só existe uma coisa a criar aqui, então o botão vai direto ao
              editor em vez de abrir uma folha com uma opção só. */}
          <div className="grid place-items-center">
            <Link
              href="/admin/posts/novo"
              aria-label="Escrever texto"
              className="-mt-6 grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-[0_8px_24px_-6px_rgb(14_79_196/0.6)] ring-4 ring-bg transition-transform active:scale-95"
            >
              <PenLine className="size-6" strokeWidth={2} />
            </Link>
          </div>

          {aba(PRINCIPAIS[2])}

          <button
            type="button"
            onClick={() => setFolha(true)}
            aria-haspopup="dialog"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium transition-colors',
              naFolha ? 'text-accent' : 'text-fg-muted',
            )}
          >
            <span className={cn('grid h-8 w-14 place-items-center rounded-full', naFolha && 'bg-accent/12')}>
              <Ellipsis className="size-6" strokeWidth={naFolha ? 2 : 1.6} />
            </span>
            Mais
          </button>
        </div>
      </nav>

      <Folha aberta={folha} aoFechar={fechar} titulo="Mais opções">
        <Link
          href="/admin/conta"
          onClick={fechar}
          className="mb-2 flex items-center gap-4 rounded-2xl bg-bg-subtle p-3"
        >
          <Avatar url={perfil.avatar_url} nome={perfil.nome} tamanho="md" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-medium">{perfil.nome}</span>
            <span className="block text-sm text-fg-muted">{ROTULO_NIVEL[perfil.role]}</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-fg-subtle" strokeWidth={1.5} />
        </Link>

        {gestao
          .filter((i) => i.href !== '/admin/conta')
          .map((i) => (
            <ItemFolha key={i.href} href={i.href} icone={i.icone} rotulo={i.rotulo} aoEscolher={fechar} />
          ))}
        <ItemFolha href="/" icone={ExternalLink} rotulo="Ver o site" aoEscolher={fechar} externo />
        <BotaoTema />

        <form action={sair} className="mt-1">
          <button
            type="submit"
            className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-2 text-left text-red-600 transition-colors active:bg-red-500/10 dark:text-red-400"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-500/10">
              <LogOut className="size-5" strokeWidth={1.6} />
            </span>
            <span className="text-base font-medium">Sair</span>
          </button>
        </form>
      </Folha>
    </>
  );
}

/* ---------------------------------------------------------- aviso */

function AvisoSenha() {
  return (
    <Link
      href="/admin/conta"
      className="mx-auto mb-5 flex w-full max-w-5xl items-center gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-3 transition-colors hover:bg-accent/15"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg">
        <KeyRound className="size-[1.15rem]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug">
        <span className="block font-medium">Crie a sua senha de acesso</span>
        <span className="hidden text-fg-muted sm:block">
          Assim você entra direto, sem depender de link.
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-accent" strokeWidth={1.75} />
    </Link>
  );
}

/* ----------------------------------------------------------- casca */

export function AdminShell({
  perfil,
  semResposta,
  semSenha,
  children,
}: {
  perfil: PerfilCurto;
  semResposta: number;
  semSenha: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    // overflow-x: clip, e não hidden: hidden transformaria este bloco em
    // contêiner de rolagem e quebraria o position: sticky lá dentro.
    <div className="min-h-dvh overflow-x-clip bg-bg-subtle lg:pl-64">
      <Lateral perfil={perfil} semResposta={semResposta} pathname={pathname} />
      <BarraTopo perfil={perfil} />

      <main className="min-w-0 px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-9">
        {semSenha && pathname !== '/admin/conta' ? <AvisoSenha /> : null}
        {children}
      </main>

      <AbaInferior perfil={perfil} semResposta={semResposta} pathname={pathname} />
    </div>
  );
}
