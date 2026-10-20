export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '19547784501';
export const EMAIL =
  process.env.NEXT_PUBLIC_EMAIL ?? 'commercial@amazonjetaviation.com';

export const WHATSAPP_DISPLAY = '+1 (954) 778-4501';

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function aogWhatsappUrl() {
  return whatsappUrl(
    'AOG - Aeronave no solo\n\nPreciso de atendimento prioritário.\n\nAeronave: \nPeça necessária: \nPart number: \nCidade e país de destino: ',
  );
}
