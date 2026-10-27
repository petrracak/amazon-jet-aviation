import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

export type PostResumo = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  categoria: { slug: string; name_pt: string; name_en: string | null; name_es: string | null } | null;
};

export type PostCompleto = PostResumo & {
  content: string;
  seo_title: string | null;
  seo_description: string | null;
};

function publico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}

const SELECT =
  'id, slug, title, excerpt, cover_image_url, published_at, categoria:categories (slug, name_pt, name_en, name_es)';

/** O PostgREST devolve objeto numa relação de um-para-um; os tipos dizem lista. */
function umaCategoria(bruto: unknown) {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  return (valor ?? null) as PostResumo['categoria'];
}

export const listarPosts = cache(async (locale: string): Promise<PostResumo[]> => {
  const { data } = await publico()
    .from('posts')
    .select(SELECT)
    .eq('locale', locale)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(60);

  return (data ?? []).map((p) => ({ ...p, categoria: umaCategoria(p.categoria) })) as PostResumo[];
});

export const buscarPost = cache(
  async (locale: string, slug: string): Promise<PostCompleto | null> => {
    const { data } = await publico()
      .from('posts')
      .select(`${SELECT}, content, seo_title, seo_description`)
      .eq('locale', locale)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (!data) return null;
    return { ...data, categoria: umaCategoria(data.categoria) } as PostCompleto;
  },
);

/**
 * Markdown para HTML.
 *
 * O texto vem do painel, escrito por quem tem acesso de equipe, então não
 * há conteúdo de visitante aqui. Links abrem na mesma aba, como num texto
 * de leitura.
 */
export function renderizar(markdown: string) {
  return marked.parse(markdown ?? '', { async: false, breaks: false, gfm: true }) as string;
}

export function nomeCategoria(
  categoria: PostResumo['categoria'],
  locale: string,
) {
  if (!categoria) return null;
  if (locale === 'en') return categoria.name_en ?? categoria.name_pt;
  if (locale === 'es') return categoria.name_es ?? categoria.name_pt;
  return categoria.name_pt;
}

export function formatarData(iso: string | null, locale: string) {
  if (!iso) return null;
  const idioma = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR';
  return new Intl.DateTimeFormat(idioma, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date(iso));
}
