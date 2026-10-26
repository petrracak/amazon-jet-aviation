'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { salvarConfig, type EstadoConfig } from '@/app/actions/configuracoes';
import { BarraSalvar, Campo, Cartao, botao, campo } from '@/components/admin/ui';
import type { Contato, Mensagens, Pixels } from '@/lib/settings';
import { cn } from '@/lib/utils';

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(botao.primario, 'flex-1 sm:flex-none')}>
      {pending ? 'Salvando…' : 'Salvar configurações'}
    </button>
  );
}

export function SettingsForm({
  contato,
  pixels,
  mensagens,
}: {
  contato: Contato;
  pixels: Pixels;
  mensagens: Mensagens;
}) {
  const [estado, acao] = useActionState<EstadoConfig, FormData>(salvarConfig, { ok: false });
  const erro = (c: string) => estado.erros?.[c];

  return (
    <form action={acao} className="space-y-4">
      <Cartao
        titulo="Contato"
        descricao="Vale para o rodapé, os botões de WhatsApp e os links de e-mail do site inteiro."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            nome="whatsapp"
            rotulo="WhatsApp"
            dica="Com código do país, sem espaços: 19547784501"
            erro={erro('whatsapp')}
          >
            <input
              id="whatsapp"
              name="whatsapp"
              inputMode="numeric"
              defaultValue={contato.whatsapp}
              className={cn(campo, 'pn')}
            />
          </Campo>

          <Campo nome="telefone_exibicao" rotulo="Telefone como aparece no site">
            <input
              id="telefone_exibicao"
              name="telefone_exibicao"
              defaultValue={contato.telefone_exibicao}
              className={cn(campo, 'pn')}
            />
          </Campo>

          <Campo nome="email" rotulo="E-mail" erro={erro('email')}>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={contato.email}
              className={campo}
            />
          </Campo>

          <Campo
            nome="instagram"
            rotulo="Instagram"
            dica="Link completo, com https://"
            erro={erro('instagram')}
          >
            <input
              id="instagram"
              name="instagram"
              defaultValue={contato.instagram}
              className={campo}
            />
          </Campo>

          <Campo nome="horario" rotulo="Horário de atendimento" className="sm:col-span-2">
            <input id="horario" name="horario" defaultValue={contato.horario} className={campo} />
          </Campo>

          <Campo nome="endereco_miami" rotulo="Endereço em Miami" className="sm:col-span-2">
            <input
              id="endereco_miami"
              name="endereco_miami"
              defaultValue={contato.endereco_miami}
              className={campo}
            />
          </Campo>

          <Campo
            nome="endereco_deerfield"
            rotulo="Escritório operacional"
            className="sm:col-span-2"
          >
            <input
              id="endereco_deerfield"
              name="endereco_deerfield"
              defaultValue={contato.endereco_deerfield}
              className={campo}
            />
          </Campo>
        </div>
      </Cartao>

      <Cartao
        titulo="Mensagens dos botões"
        descricao="O texto que já vai escrito quando a pessoa abre o WhatsApp pelo site."
      >
        <div className="grid gap-5">
          <Campo nome="whatsapp_padrao" rotulo="Botão de WhatsApp comum">
            <textarea
              id="whatsapp_padrao"
              name="whatsapp_padrao"
              rows={2}
              defaultValue={mensagens.whatsapp_padrao}
              className={cn(campo, 'resize-y leading-relaxed')}
            />
          </Campo>

          <Campo
            nome="whatsapp_aog"
            rotulo="Botão de AOG"
            dica="Deixe os campos em branco para a pessoa preencher: aeronave, peça, part number."
          >
            <textarea
              id="whatsapp_aog"
              name="whatsapp_aog"
              rows={4}
              defaultValue={mensagens.whatsapp_aog}
              className={cn(campo, 'resize-y leading-relaxed')}
            />
          </Campo>
        </div>
      </Cartao>

      <Cartao
        titulo="Pixels e rastreio"
        descricao="Cole só o identificador, não o código inteiro. Quem cuida do tráfego mexe aqui sem programador. Campo vazio desliga."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            nome="meta_pixel_id"
            rotulo="Meta Pixel"
            dica="Só os números, ex.: 123456789012345"
            erro={erro('meta_pixel_id')}
          >
            <input
              id="meta_pixel_id"
              name="meta_pixel_id"
              defaultValue={pixels.meta_pixel_id ?? ''}
              className={cn(campo, 'pn')}
            />
          </Campo>

          <Campo nome="ga4_id" rotulo="Google Analytics 4" dica="Começa com G-" erro={erro('ga4_id')}>
            <input
              id="ga4_id"
              name="ga4_id"
              defaultValue={pixels.ga4_id ?? ''}
              className={cn(campo, 'pn')}
            />
          </Campo>

          <Campo nome="gtm_id" rotulo="Google Tag Manager" dica="Começa com GTM-" erro={erro('gtm_id')}>
            <input
              id="gtm_id"
              name="gtm_id"
              defaultValue={pixels.gtm_id ?? ''}
              className={cn(campo, 'pn')}
            />
          </Campo>

          <Campo
            nome="google_ads_id"
            rotulo="Google Ads"
            dica="Começa com AW-"
            erro={erro('google_ads_id')}
          >
            <input
              id="google_ads_id"
              name="google_ads_id"
              defaultValue={pixels.google_ads_id ?? ''}
              className={cn(campo, 'pn')}
            />
          </Campo>
        </div>
      </Cartao>

      <BarraSalvar
        mensagem={
          estado.mensagem ?? (estado.erros ? 'Confira os campos marcados em vermelho.' : undefined)
        }
        tom={estado.ok ? 'sucesso' : estado.mensagem || estado.erros ? 'erro' : 'neutro'}
      >
        <Salvar />
      </BarraSalvar>
    </form>
  );
}
