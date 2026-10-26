import type { Contato, Mensagens } from '@/lib/settings';

export function whatsappUrl(numero: string, mensagem?: string) {
  const base = `https://wa.me/${numero.replace(/\D/g, '')}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Link do botão comum de WhatsApp, com a mensagem que o painel define. */
export function linkWhatsApp(contato: Contato, mensagens: Mensagens) {
  return whatsappUrl(contato.whatsapp, mensagens.whatsapp_padrao);
}

/**
 * Link do botão de AOG. A mensagem vem do painel e os campos em branco
 * ficam para a pessoa preencher, que é o que acelera o atendimento.
 */
export function linkAog(contato: Contato, mensagens: Mensagens) {
  return whatsappUrl(
    contato.whatsapp,
    `${mensagens.whatsapp_aog}\n\nAeronave: \nPeça necessária: \nPart number: \nCidade e país de destino: `,
  );
}
