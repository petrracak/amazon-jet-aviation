import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Newspaper } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/reveal';
import { formatarData, listarPosts, nomeCategoria } from '@/lib/blog';
import { routing } from '@/i18n/routing';

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: `${t('title')} | Amazon Jet Aviation`, description: t('description') };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, posts] = await Promise.all([
    getTranslations({ locale, namespace: 'blog' }),
    listarPosts(locale),
  ]);

  const [destaque, ...demais] = posts;

  return (
    <div className="bg-night">
      <header className="relative overflow-hidden border-b border-night-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_28rem_at_20%_0%,rgb(63_135_245/0.18),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-32 sm:px-6 sm:pb-16 sm:pt-36">
          <p className="tag">
            <Newspaper size={15} weight="fill" />
            {t('eyebrow')}
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.08] text-white">
            {t('title')}
          </h1>
          <p className="measure mt-5 text-base leading-relaxed text-mist-soft sm:text-lg">
            {t('description')}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        {posts.length === 0 ? (
          <p className="text-mist-soft">{t('vazio')}</p>
        ) : (
          <>
            {destaque ? <Destaque post={destaque} locale={locale} ler={t('ler')} /> : null}

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {demais.map((post, i) => (
                <Reveal key={post.id} atraso={i * 70} as="article">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition-all duration-300 hover:-translate-y-1 hover:border-tag/40"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-night-3">
                      {post.cover_image_url ? (
                        <Image
                          src={post.cover_image_url}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 30vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <Meta post={post} locale={locale} />
                      <h2 className="mt-3 font-display text-lg leading-snug text-white transition-colors group-hover:text-tag">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-mist-soft">
                          {post.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-tag">
                        {t('ler')}
                        <ArrowRight
                          size={15}
                          weight="bold"
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Meta({
  post,
  locale,
}: {
  post: { published_at: string | null; categoria: Awaited<ReturnType<typeof listarPosts>>[number]['categoria'] };
  locale: string;
}) {
  const categoria = nomeCategoria(post.categoria, locale);
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-mist-soft">
      {categoria ? (
        <span className="rounded-sm bg-tag/15 px-2 py-1 font-medium text-tag">{categoria}</span>
      ) : null}
      {formatarData(post.published_at, locale)}
    </p>
  );
}

function Destaque({
  post,
  locale,
  ler,
}: {
  post: Awaited<ReturnType<typeof listarPosts>>[number];
  locale: string;
  ler: string;
}) {
  return (
    <Reveal as="article">
      <Link
        href={`/blog/${post.slug}`}
        className="group grid overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition-all duration-300 hover:border-tag/40 lg:grid-cols-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-night-3 lg:aspect-auto lg:min-h-[22rem]">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : null}
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-9">
          <Meta post={post} locale={locale} />
          <h2 className="mt-4 font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-white transition-colors group-hover:text-tag">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="measure mt-4 leading-relaxed text-mist-soft">{post.excerpt}</p>
          ) : null}
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-tag">
            {ler}
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
