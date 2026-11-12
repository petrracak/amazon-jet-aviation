import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { DadosEstruturados } from '@/components/dados-estruturados';
import { BASE, alternativas, compartilhamento } from '@/lib/seo';
import { buscarPost, formatarData, listarPosts, nomeCategoria, renderizar } from '@/lib/blog';
import { linkWhatsApp } from '@/lib/contact';
import { getConfig } from '@/lib/settings';

export const revalidate = 300;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await buscarPost(locale, slug);
  if (!post) return {};

  const titulo = post.seo_title ?? `${post.title} | Amazon Jet Aviation`;
  const descricao = post.seo_description ?? post.excerpt ?? undefined;

  return {
    title: titulo,
    description: descricao,
    alternates: alternativas(locale, `/blog/${slug}`),
    ...compartilhamento({
      locale,
      titulo: post.title,
      descricao,
      caminho: `/blog/${slug}`,
      imagem: post.cover_image_url ?? '/og.jpg',
      tipo: 'article',
    }),
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [post, t, { contato, mensagens }] = await Promise.all([
    buscarPost(locale, slug),
    getTranslations({ locale, namespace: 'blog' }),
    getConfig(),
  ]);

  if (!post) notFound();

  const outros = (await listarPosts(locale)).filter((p) => p.slug !== post.slug).slice(0, 3);
  const categoria = nomeCategoria(post.categoria, locale);

  
  // O texto como dado: autoria, datas e imagem. É o que faz um artigo
  // aparecer como artigo — e não como página solta — para buscador e IA.
  const artigo = post && {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    image: post.cover_image_url ? `${BASE}${post.cover_image_url}` : `${BASE}/og.jpg`,
    datePublished: post.published_at ?? undefined,
    dateModified: post.published_at ?? undefined,
    inLanguage: locale,
    mainEntityOfPage: alternativas(locale, `/blog/${slug}`).canonical,
    author: { '@id': `${BASE}/#organizacao` },
    publisher: { '@id': `${BASE}/#organizacao` },
  };

  const trilha = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: alternativas(locale, '/blog').canonical },
      { '@type': 'ListItem', position: 2, name: post?.title ?? slug },
    ],
  };

  return (
    <>
      {artigo ? <DadosEstruturados dados={artigo} /> : null}
      <DadosEstruturados dados={trilha} />

      <div className="bg-night">
      <article>
        <header className="relative overflow-hidden border-b border-night-line">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_28rem_at_25%_0%,rgb(63_135_245/0.16),transparent_65%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-36">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-sm text-mist-soft transition-colors hover:text-white"
            >
              <ArrowLeft size={16} weight="bold" className="transition-transform group-hover:-translate-x-1" />
              {t('voltar')}
            </Link>

            <p className="mt-7 flex flex-wrap items-center gap-2.5 text-xs text-mist-soft">
              {categoria ? (
                <span className="rounded-sm bg-tag/15 px-2.5 py-1 font-medium text-tag">
                  {categoria}
                </span>
              ) : null}
              {formatarData(post.published_at, locale)}
            </p>

            <h1 className="mt-5 font-display text-[clamp(1.9rem,4.2vw,2.9rem)] leading-[1.1] text-white">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-5 text-lg leading-relaxed text-mist-soft">{post.excerpt}</p>
            ) : null}
          </div>
        </header>

        {post.cover_image_url ? (
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="relative -mt-0 aspect-[16/9] overflow-hidden rounded-xl sm:rounded-2xl">
              <Image
                src={post.cover_image_url}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div
          className="prosa mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16"
          dangerouslySetInnerHTML={{ __html: renderizar(post.content) }}
        />
      </article>

      <section className="border-t border-night-line">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-2xl text-white">{t('ctaTitulo')}</h2>
          <p className="measure mx-auto mt-3 leading-relaxed text-mist-soft">{t('ctaTexto')}</p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/cotacao"
              className="group inline-flex items-center gap-2 rounded-full bg-tag px-6 py-3.5 font-semibold text-night transition-all hover:-translate-y-0.5"
            >
              {t('ctaBotao')}
              <ArrowRight size={17} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={linkWhatsApp(contato, mensagens)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:border-white/60"
            >
              <WhatsappLogo size={19} weight="fill" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {outros.length ? (
        <section className="border-t border-night-line bg-night-2">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-xl text-white">{t('outros')}</h2>

            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {outros.map((outro) => (
                <Link
                  key={outro.id}
                  href={`/blog/${outro.slug}`}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition-all duration-300 hover:-translate-y-1 hover:border-tag/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-night-3">
                    {outro.cover_image_url ? (
                      <Image
                        src={outro.cover_image_url}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-mist-soft">
                      {formatarData(outro.published_at, locale)}
                    </p>
                    <h3 className="mt-2 font-display text-base leading-snug text-white transition-colors group-hover:text-tag">
                      {outro.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      </div>
    </>
  );
}
