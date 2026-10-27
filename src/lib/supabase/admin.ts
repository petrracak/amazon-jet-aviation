import 'server-only';

import { createClient } from '@supabase/supabase-js';

/**
 * Cliente com a chave de serviço: ignora a RLS e fala com a API de
 * administração do Auth. É o único jeito de criar a conta de outra pessoa
 * ou definir a senha dela.
 *
 * Regras de uso, sem exceção:
 * - só em Server Action ou Route Handler, nunca em componente de cliente;
 * - sempre depois de `exigirAdmin()`, nunca antes;
 * - nunca devolver o resultado cru para o navegador.
 *
 * O "server-only" acima quebra o build se alguém importar isto de um
 * componente de cliente, em vez de vazar a chave silenciosamente.
 */
export function createAdminClient() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error('SEM_CHAVE_DE_SERVICO');

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** O painel usa isto para avisar, em vez de quebrar numa tela de erro. */
export function temChaveDeServico() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
