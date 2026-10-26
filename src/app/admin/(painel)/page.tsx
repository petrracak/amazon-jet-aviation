import { ChevronRight, ExternalLink, FileText, Newspaper, PenLine, Settings } from 'lucide-react';
import Link from 'next/link';

import { QuoteCard, type Quote } from '@/components/admin/quote-card';
import { Cabecalho, Cartao, Pagina, SeloSituacao } from '@/components/admin/ui';
import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Início' };

function Numero({ rotulo, valor, href }: { rotulo: string; valor: number; href: string }) {
  return (
    <Link
      href={href}
      className="group min-w-0 rounded-2xl border border-border-base bg-bg-elevated p-4 shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
    >
      <p className="font-display text-4xl leading-none">{valor}</p>
      <p className="mt-3 text-sm text-fg-muted">{rotulo}</p>
    </Link>
  );
}

function Atalho({
  href,
  icone: Icone,
  rotulo,
  externo,
}: {
  href: string;
  icone: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  rotulo: string;
  externo?: boolean;
}) {
  return (
    <Link
      href={href}
      target={externo ? '_blank' : undefined}
      className="flex min-h-14 min-w-0 items-center gap-3 rounded-2xl border border-border-base bg-bg-elevated px-4 transition-colors hover:border-accent active:scale-[0.98]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
        <Icone className="size-[1.15rem]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 truncate text-sm font-medium">{rotulo}</span>
    </Link>
  );
}

function saudacao() {
  const hora = Number(
    new Intl.DateTimeFormat('pt-BR', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/New_York',
    }).format(new Date()),
  );
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default async function Painel() {
  const perfil = await exigirPerfil();
  const supabase = await createClient();

  const [semResposta, aog, publicados, paraResponder, recentes] = await Promise.all([
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('quotes')
      .select('id', { count: 'exact', head: true })
      .eq('is_aog', true)
      .eq('status', 'new'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase
      .from('quotes')
      .select('id, ref, name, phone, email, aircraft_model, is_aog, status, created_at')
      .eq('status', 'new')
      .order('is_aog', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('posts')
      .select('id, title, status, published_at')
      .order('updated_at', { ascending: false })
      .limit(4),
  ]);

  const primeiroNome = perfil.nome.split(' ')[0];
  const esperando = semResposta.count ?? 0;
  const urgentes = aog.count ?? 0;

  return (
    <Pagina>
      <Cabecalho
        titulo={`${saudacao()}, ${primeiroNome}`}
        descricao="Quem está esperando resposta e o que está no ar."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link
          href="/admin/cotacoes?status=new"
          className="col-span-2 flex min-w-0 items-center justify-between gap-4 rounded-2xl bg-ink p-5 text-white shadow-[var(--shadow-card)] transition-transform active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-display text-5xl leading-none">{esperando}</p>
            <p className="mt-2 text-sm text-white/75">
              {esperando === 1 ? 'cotação esperando resposta' : 'cotações esperando resposta'}
            </p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-ink">
            <ChevronRight className="size-6" strokeWidth={2} />
          </span>
        </Link>

        {/* AOG tem card próprio e cor própria: é a única coisa aqui que não
            pode esperar o fim do expediente. */}
        <Link
          href="/admin/cotacoes?aog=1"
          className={
            urgentes > 0
              ? 'min-w-0 rounded-2xl bg-aog p-4 text-white shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]'
              : 'min-w-0 rounded-2xl border border-border-base bg-bg-elevated p-4 shadow-[var(--shadow-card)] transition-colors hover:border-border-strong'
          }
        >
          <p className="font-display text-4xl leading-none">{urgentes}</p>
          <p className={urgentes > 0 ? 'mt-3 text-sm text-white/80' : 'mt-3 text-sm text-fg-muted'}>
            {urgentes === 1 ? 'pedido AOG aberto' : 'pedidos AOG abertos'}
          </p>
        </Link>

        <Numero rotulo="textos no ar" valor={publicados.count ?? 0} href="/admin/posts" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Atalho href="/admin/posts/novo" icone={PenLine} rotulo="Novo texto" />
        <Atalho href="/admin/cotacoes" icone={FileText} rotulo="Todas as cotações" />
        <Atalho href="/admin/configuracoes" icone={Settings} rotulo="Configurações" />
        <Atalho href="/" icone={ExternalLink} rotulo="Abrir o site" externo />
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl">Para responder agora</h2>
          <Link
            href="/admin/cotacoes"
            className="inline-flex min-h-11 items-center text-sm font-medium text-accent"
          >
            Ver todas
          </Link>
        </div>

        {paraResponder.data?.length ? (
          <ul className="grid gap-3 lg:grid-cols-2">
            {paraResponder.data.map((q) => (
              <QuoteCard key={q.id} cotacao={q as Quote} />
            ))}
          </ul>
        ) : (
          <Cartao>
            <p className="text-sm text-fg-muted">
              Ninguém esperando resposta. Quando alguém pedir cotação no site, aparece aqui com o
              WhatsApp pronto.
            </p>
          </Cartao>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl">Blog</h2>
          <Link
            href="/admin/posts"
            className="inline-flex min-h-11 items-center text-sm font-medium text-accent"
          >
            Ver textos
          </Link>
        </div>

        <Cartao className="!p-2 sm:!p-3">
          {recentes.data?.length ? (
            <ul className="divide-y divide-border-base">
              {recentes.data.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="flex min-h-14 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-bg-subtle"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-bg-subtle text-fg-subtle">
                      <Newspaper className="size-5" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.9375rem] font-medium">{post.title}</p>
                      {post.published_at ? (
                        <p className="truncate text-sm text-fg-muted">
                          {formatDate(post.published_at)}
                        </p>
                      ) : null}
                    </div>
                    <SeloSituacao situacao={post.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-3 text-sm text-fg-muted">Nenhum texto ainda.</p>
          )}
        </Cartao>
      </section>
    </Pagina>
  );
}
