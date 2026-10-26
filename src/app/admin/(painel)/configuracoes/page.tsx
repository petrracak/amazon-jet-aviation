import { SettingsForm } from '@/components/admin/settings-form';
import { Cabecalho, Pagina } from '@/components/admin/ui';
import { exigirAdmin } from '@/lib/auth';
import { getConfig } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Configurações' };

export default async function Configuracoes() {
  await exigirAdmin();
  const config = await getConfig();

  return (
    <Pagina largura="max-w-3xl">
      <Cabecalho
        titulo="Configurações"
        descricao="O que muda aqui vale para o site inteiro, nos três idiomas."
      />
      <SettingsForm
        contato={config.contato}
        pixels={config.pixels}
        mensagens={config.mensagens}
      />
    </Pagina>
  );
}
