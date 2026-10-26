import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { apagarPost } from '@/app/actions/posts';
import { PostFormulario } from '@/components/admin/post-form';
import { Cabecalho, Cartao, Pagina, SeloSituacao, botao } from '@/components/admin/ui';
import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function EditarPost({ params }: { params: Promise<{ id: string }> }) {
  const perfil = await exigirPerfil();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: post }, { data: categorias }] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).maybeSingle(),
    supabase.from('categories').select('id, name_pt').order('sort_order'),
  ]);

  if (!post) notFound();

  const endereco = post.locale === 'pt' ? `/blog/${post.slug}` : `/${post.locale}/blog/${post.slug}`;

  async function apagar() {
    'use server';
    await apagarPost(id);
    redirect('/admin/posts');
  }

  return (
    <Pagina largura="max-w-3xl">
      <Cabecalho
        voltar={{ href: '/admin/posts', rotulo: 'Blog' }}
        titulo={post.title}
        descricao={<SeloSituacao situacao={post.status} />}
        acoes={
          post.status === 'published' ? (
            <Link href={endereco} target="_blank" className={botao.secundario}>
              <ExternalLink className="size-5" strokeWidth={1.6} />
              Ver no site
            </Link>
          ) : null
        }
      />

      <PostFormulario post={post} categorias={categorias ?? []} />

      {perfil.role === 'admin' ? (
        <Cartao
          tom="perigo"
          titulo="Apagar texto"
          descricao="Remove o texto e a imagem de capa, sem volta. Para só tirar do ar, mude a situação para Rascunho."
        >
          <form action={apagar}>
            <button type="submit" className={botao.perigo}>
              Apagar definitivamente
            </button>
          </form>
        </Cartao>
      ) : null}
    </Pagina>
  );
}
