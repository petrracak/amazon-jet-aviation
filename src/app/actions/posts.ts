'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { exigirAdmin, exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  title: z.string().trim().min(3, 'Dê um título ao texto.'),
  slug: z.string().trim().max(80).optional(),
  excerpt: z.string().trim().max(400).optional(),
  content: z.string().trim().max(60000).optional(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  locale: z.enum(['pt', 'en', 'es']),
  status: z.enum(['draft', 'published']),
  cover_image_url: z.string().trim().optional(),
  cover_image_path: z.string().trim().optional(),
  seo_title: z.string().trim().max(120).optional(),
  seo_description: z.string().trim().max(200).optional(),
});

export type EstadoPost = {
  ok: boolean;
  id?: string;
  mensagem?: string;
  erros?: Record<string, string>;
};

/** Garante slug único dentro do idioma: "titulo", "titulo-2", "titulo-3"… */
async function slugLivre(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  locale: string,
  ignorarId?: string,
) {
  for (let n = 1; n < 50; n++) {
    const tentativa = n === 1 ? base : `${base}-${n}`;
    const { data } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', tentativa)
      .eq('locale', locale)
      .maybeSingle();

    if (!data || data.id === ignorarId) return tentativa;
  }
  return `${base}-${Date.now()}`;
}

export async function salvarPost(
  _anterior: EstadoPost,
  formData: FormData,
): Promise<EstadoPost> {
  const perfil = await exigirPerfil();

  const resultado = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!resultado.success) {
    const erros: Record<string, string> = {};
    for (const p of resultado.error.issues) {
      erros[String(p.path[0] ?? 'form')] ??= p.message;
    }
    return { ok: false, erros };
  }

  const { id, ...dados } = resultado.data;
  const supabase = await createClient();

  const base = slugify(dados.slug || dados.title);
  const slug = await slugLivre(
    supabase,
    base || `texto-${Date.now()}`,
    dados.locale,
    id || undefined,
  );

  const campos = {
    title: dados.title,
    slug,
    locale: dados.locale,
    excerpt: dados.excerpt || null,
    content: dados.content || '',
    category_id: dados.category_id || null,
    status: dados.status,
    cover_image_url: dados.cover_image_url || null,
    cover_image_path: dados.cover_image_path || null,
    seo_title: dados.seo_title || null,
    seo_description: dados.seo_description || dados.excerpt || null,
  };

  if (id) {
    // A data de publicação é gravada na primeira vez que o texto vai ao ar.
    const { data: atual } = await supabase
      .from('posts')
      .select('published_at')
      .eq('id', id)
      .maybeSingle();

    const published_at =
      dados.status === 'published' && !atual?.published_at
        ? new Date().toISOString()
        : (atual?.published_at ?? null);

    const { error } = await supabase
      .from('posts')
      .update({ ...campos, published_at })
      .eq('id', id);

    if (error) return { ok: false, mensagem: `Não deu para salvar: ${error.message}` };

    revalidatePath('/admin', 'layout');
    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return { ok: true, id, mensagem: 'Alterações salvas.' };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...campos,
      author_id: perfil.id,
      published_at: dados.status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) return { ok: false, mensagem: `Não deu para criar: ${error.message}` };

  revalidatePath('/admin', 'layout');
  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  return { ok: true, id: data.id, mensagem: 'Texto criado.' };
}

export async function apagarPost(id: string) {
  // Esconder o botão não autoriza nada: a regra vale aqui também.
  await exigirAdmin();
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('cover_image_path')
    .eq('id', id)
    .maybeSingle();

  if (post?.cover_image_path) {
    await supabase.storage.from('blog').remove([post.cover_image_path]);
  }

  await supabase.from('posts').delete().eq('id', id);

  revalidatePath('/admin', 'layout');
  revalidatePath('/admin/posts');
  revalidatePath('/blog');
}
