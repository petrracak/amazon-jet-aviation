import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

export type Contato = {
  whatsapp: string;
  telefone_exibicao: string;
  email: string;
  instagram: string;
  horario: string;
  endereco_miami: string;
  endereco_deerfield: string;
};

export type Pixels = {
  meta_pixel_id?: string;
  ga4_id?: string;
  gtm_id?: string;
  google_ads_id?: string;
};

export type Mensagens = {
  whatsapp_padrao: string;
  whatsapp_aog: string;
};

const PADRAO = {
  contato: {
    whatsapp: '19547784501',
    telefone_exibicao: '+1 (954) 778-4501',
    email: 'commercial@amazonjetaviation.com',
    instagram: 'https://instagram.com/amazon.jet.aviation',
    horario: 'Segunda a sexta, das 9h às 17h (horário da Flórida)',
    endereco_miami:
      '200 S Biscayne Blvd, Suite 20-107, Miami, FL 33131, Estados Unidos',
    endereco_deerfield:
      '455 Fairway Drive, Suite 214, Deerfield Beach, FL 33441, Estados Unidos',
  } satisfies Contato,
  pixels: {} satisfies Pixels,
  mensagens: {
    whatsapp_padrao: 'Olá! Vim pelo site e quero pedir uma cotação de peças.',
    whatsapp_aog:
      'AOG - Aeronave no solo. Preciso de atendimento prioritário.',
  } satisfies Mensagens,
};

export type Config = {
  contato: Contato;
  pixels: Pixels;
  mensagens: Mensagens;
};

/**
 * Lê o que o painel edita. Cliente sem cookie de sessão de propósito: isto
 * roda na renderização das páginas públicas, que são cacheadas. Se o banco
 * não responder, o site fica de pé com os valores padrão — nunca em branco.
 */
export const getConfig = cache(async (): Promise<Config> => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );

    const { data } = await supabase.from('site_settings').select('key, value');
    const mapa = new Map((data ?? []).map((l) => [l.key, l.value]));

    return {
      contato: { ...PADRAO.contato, ...(mapa.get('contato') as object) },
      pixels: { ...PADRAO.pixels, ...(mapa.get('pixels') as object) },
      mensagens: { ...PADRAO.mensagens, ...(mapa.get('mensagens') as object) },
    };
  } catch {
    return PADRAO;
  }
});
