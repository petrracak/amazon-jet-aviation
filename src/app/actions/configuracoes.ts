'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { exigirAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/** Só dígitos, letras, hífen e sublinhado: ID de pixel não tem outra coisa. */
const idPixel = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\w-]*$/, 'Use apenas letras, números, hífen e sublinhado.')
  .optional()
  .or(z.literal(''));

const schema = z.object({
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, '')),
  telefone_exibicao: z.string().trim().max(40),
  email: z.string().email('E-mail inválido.').or(z.literal('')),
  instagram: z.string().url('Link inválido.').or(z.literal('')),
  horario: z.string().trim().max(120),
  endereco_miami: z.string().trim().max(200),
  endereco_deerfield: z.string().trim().max(200),
  whatsapp_padrao: z.string().trim().max(400),
  whatsapp_aog: z.string().trim().max(400),
  meta_pixel_id: idPixel,
  ga4_id: idPixel,
  gtm_id: idPixel,
  google_ads_id: idPixel,
});

export type EstadoConfig = {
  ok: boolean;
  mensagem?: string;
  erros?: Record<string, string>;
};

export async function salvarConfig(
  _anterior: EstadoConfig,
  formData: FormData,
): Promise<EstadoConfig> {
  const perfil = await exigirAdmin();

  const resultado = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!resultado.success) {
    const erros: Record<string, string> = {};
    for (const p of resultado.error.issues) {
      erros[String(p.path[0] ?? 'form')] ??= p.message;
    }
    return { ok: false, erros };
  }

  const d = resultado.data;
  const supabase = await createClient();

  const { error } = await supabase.from('site_settings').upsert(
    [
      {
        key: 'contato',
        value: {
          whatsapp: d.whatsapp,
          telefone_exibicao: d.telefone_exibicao,
          email: d.email,
          instagram: d.instagram,
          horario: d.horario,
          endereco_miami: d.endereco_miami,
          endereco_deerfield: d.endereco_deerfield,
        },
        updated_by: perfil.id,
      },
      {
        key: 'mensagens',
        value: {
          whatsapp_padrao: d.whatsapp_padrao,
          whatsapp_aog: d.whatsapp_aog,
        },
        updated_by: perfil.id,
      },
      {
        key: 'pixels',
        value: {
          meta_pixel_id: d.meta_pixel_id ?? '',
          ga4_id: d.ga4_id ?? '',
          gtm_id: d.gtm_id ?? '',
          google_ads_id: d.google_ads_id ?? '',
        },
        updated_by: perfil.id,
      },
    ],
    { onConflict: 'key' },
  );

  if (error) return { ok: false, mensagem: `Não deu para salvar: ${error.message}` };

  revalidatePath('/', 'layout');
  return { ok: true, mensagem: 'Configurações salvas. O site já está usando.' };
}
