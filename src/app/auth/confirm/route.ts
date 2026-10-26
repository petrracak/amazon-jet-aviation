import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Fim do caminho do link de acesso por e-mail: troca o token por sessão e
 * leva para o painel. Link inválido ou vencido volta ao login com o motivo.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/admin';

  if (!token_hash || !type) {
    redirect('/admin/login?erro=link-invalido');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    redirect('/admin/login?erro=link-expirado');
  }

  redirect(next.startsWith('/') ? next : '/admin');
}
