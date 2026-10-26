'use server';

import { revalidatePath } from 'next/cache';

import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/** Grava a foto que o navegador acabou de enviar para o Storage. */
export async function salvarAvatar(url: string | null) {
  const perfil = await exigirPerfil();
  const supabase = await createClient();

  await supabase.from('profiles').update({ avatar_url: url }).eq('id', perfil.id);

  revalidatePath('/admin', 'layout');
}

export async function salvarNome(nome: string) {
  const perfil = await exigirPerfil();
  const limpo = nome.trim().slice(0, 80);
  if (limpo.length < 2) return { ok: false, mensagem: 'Escreva o seu nome.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: limpo })
    .eq('id', perfil.id);

  if (error) return { ok: false, mensagem: 'Não deu para salvar agora.' };

  revalidatePath('/admin', 'layout');
  return { ok: true, mensagem: 'Nome salvo.' };
}
