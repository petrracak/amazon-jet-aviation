import { PostFormulario } from '@/components/admin/post-form';
import { Cabecalho, Pagina } from '@/components/admin/ui';
import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Escrever texto' };

export default async function NovoPost() {
  await exigirPerfil();

  const supabase = await createClient();
  const { data: categorias } = await supabase
    .from('categories')
    .select('id, name_pt')
    .order('sort_order');

  return (
    <Pagina largura="max-w-3xl">
      <Cabecalho
        voltar={{ href: '/admin/posts', rotulo: 'Blog' }}
        titulo="Escrever texto"
        descricao="Salve como rascunho quantas vezes quiser. O texto só aparece no site quando a situação for No ar."
      />
      <PostFormulario categorias={categorias ?? []} />
    </Pagina>
  );
}
