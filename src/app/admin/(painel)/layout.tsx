import { AdminShell } from '@/components/admin/admin-shell';
import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  // A contagem de cotações sem resposta vira o selo da aba: quem abre o
  // painel já vê se tem alguém esperando. Em paralelo com o perfil, que não
  // depende dela e trava a página se a sessão for inválida.
  const supabase = await createClient();
  const [perfil, { count }] = await Promise.all([
    exigirPerfil(),
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  return (
    <AdminShell
      perfil={{ nome: perfil.nome, role: perfil.role, avatar_url: perfil.avatar_url }}
      semResposta={count ?? 0}
      semSenha={!perfil.senhaPropria}
    >
      {children}
    </AdminShell>
  );
}
