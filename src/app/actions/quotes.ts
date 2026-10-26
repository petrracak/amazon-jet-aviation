'use server';

import { revalidatePath } from 'next/cache';

import { exigirPerfil } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export type StatusCotacao = 'new' | 'in_progress' | 'quoted' | 'won' | 'lost';

export async function mudarStatusCotacao(id: string, status: StatusCotacao) {
  await exigirPerfil();
  const supabase = await createClient();
  await supabase.from('quotes').update({ status }).eq('id', id);
  revalidatePath('/admin', 'layout');
  revalidatePath('/admin/cotacoes');
  revalidatePath('/admin');
}
