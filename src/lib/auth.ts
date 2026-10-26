import { cache } from 'react';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export type Perfil = {
  id: string;
  nome: string;
  email: string | null;
  role: 'admin' | 'editor';
  ativo: boolean;
  avatar_url: string | null;
  /** Já definiu a própria senha em /admin/conta. */
  senhaPropria: boolean;
};

/**
 * Perfil de quem está logado. Manda para o login se não houver sessão, e
 * trata conta sem perfil ou desativada como sem acesso.
 *
 * Envolvida em cache(): o layout e a página chamam isto na mesma requisição.
 *
 * A identidade sai de getClaims(), que confere a assinatura do token sem ida
 * à rede. Quem decide o acesso é o perfil no banco, lido a cada requisição,
 * então desativar alguém vale na hora, sem esperar o token expirar.
 */
export const exigirPerfil = cache(async (): Promise<Perfil> => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect('/admin/login');

  const { data: perfil } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, ativo, avatar_url')
    .eq('id', claims.sub)
    .maybeSingle();

  if (!perfil || !perfil.ativo) redirect('/admin/login?erro=sem-acesso');

  const meta = claims.user_metadata as { senha_propria?: boolean } | undefined;

  return {
    id: perfil.id,
    nome: perfil.full_name ?? 'Equipe',
    email: perfil.email,
    role: perfil.role,
    ativo: perfil.ativo,
    avatar_url: perfil.avatar_url,
    senhaPropria: meta?.senha_propria === true,
  };
});

export async function exigirAdmin(): Promise<Perfil> {
  const perfil = await exigirPerfil();
  if (perfil.role !== 'admin') redirect('/admin');
  return perfil;
}
