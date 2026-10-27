'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { exigirAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const SENHA_MINIMA = 8;

const schemaCriar = z.object({
  nome: z.string().trim().min(3, 'Escreva o nome completo.').max(120),
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(160),
  role: z.enum(['admin', 'editor']),
  senha: z
    .string()
    .min(SENHA_MINIMA, `A senha precisa ter ao menos ${SENHA_MINIMA} caracteres.`)
    .max(72, 'Senha longa demais.'),
});

export type EstadoEquipe = {
  ok: boolean;
  mensagem?: string;
  erros?: Record<string, string>;
};

const SEM_CHAVE =
  'Falta a chave de serviço do Supabase para criar contas. Veja docs/acesso-ao-painel.md.';

/**
 * Cria a conta de uma pessoa e já deixa o perfil no nível escolhido.
 *
 * O gatilho do banco cria todo perfil como editor, de propósito: promover é
 * ato explícito, feito aqui, depois da checagem de administrador.
 */
export async function criarMembro(
  _anterior: EstadoEquipe,
  formData: FormData,
): Promise<EstadoEquipe> {
  await exigirAdmin();

  const resultado = schemaCriar.safeParse(Object.fromEntries(formData.entries()));
  if (!resultado.success) {
    const erros: Record<string, string> = {};
    for (const p of resultado.error.issues) {
      erros[String(p.path[0] ?? 'form')] ??= p.message;
    }
    return { ok: false, erros };
  }

  const { nome, email, role, senha } = resultado.data;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, mensagem: SEM_CHAVE };
  }

  const { data: criado, error } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { full_name: nome },
  });

  if (error) {
    return {
      ok: false,
      mensagem: /already|exists|registered/i.test(error.message)
        ? 'Já existe uma conta com esse e-mail.'
        : `Não deu para criar: ${error.message}`,
    };
  }

  const { error: erroPerfil } = await supabase
    .from('profiles')
    .update({ full_name: nome, email, role, ativo: true })
    .eq('id', criado.user.id);

  if (erroPerfil) {
    return { ok: false, mensagem: `Conta criada, mas o perfil falhou: ${erroPerfil.message}` };
  }

  revalidatePath('/admin/equipe');
  return {
    ok: true,
    mensagem: `Conta criada para ${email}. Passe a senha provisória e peça para trocar em Minha conta.`,
  };
}

/** Resolve esquecimento de senha sem depender de e-mail. */
export async function definirSenhaDe(membroId: string, senha: string) {
  const admin = await exigirAdmin();

  if (senha.length < SENHA_MINIMA) {
    return { ok: false, mensagem: `A senha precisa ter ao menos ${SENHA_MINIMA} caracteres.` };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, mensagem: SEM_CHAVE };
  }

  const { error } = await supabase.auth.admin.updateUserById(membroId, { password: senha });
  if (error) return { ok: false, mensagem: `Não deu para trocar: ${error.message}` };

  revalidatePath('/admin/equipe');
  return {
    ok: true,
    mensagem:
      membroId === admin.id
        ? 'Sua senha foi trocada.'
        : 'Senha definida. Passe para a pessoa e peça para ela trocar depois.',
  };
}

/* Nível e situação são linha de tabela: passam pela RLS normal, sem chave
   de serviço. Só criar conta e definir senha de outro é que exigem ela. */

export async function alterarPapel(membroId: string, role: 'admin' | 'editor') {
  const admin = await exigirAdmin();

  if (membroId === admin.id) {
    return { ok: false, mensagem: 'Você não pode mudar o seu próprio nível de acesso.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', membroId);
  if (error) return { ok: false, mensagem: `Não deu para salvar: ${error.message}` };

  revalidatePath('/admin/equipe');
  return { ok: true, mensagem: 'Nível de acesso atualizado.' };
}

export async function alterarSituacao(membroId: string, ativo: boolean) {
  const admin = await exigirAdmin();

  if (membroId === admin.id) {
    return { ok: false, mensagem: 'Você não pode desativar o seu próprio acesso.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ ativo }).eq('id', membroId);
  if (error) return { ok: false, mensagem: `Não deu para salvar: ${error.message}` };

  revalidatePath('/admin/equipe');
  return { ok: true, mensagem: ativo ? 'Acesso reativado.' : 'Acesso suspenso.' };
}
