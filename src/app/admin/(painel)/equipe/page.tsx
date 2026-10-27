import { Info } from 'lucide-react';

import { TeamForm } from '@/components/admin/team-form';
import { TeamRow, type Membro } from '@/components/admin/team-row';
import { Cabecalho, Cartao, Pagina } from '@/components/admin/ui';
import { exigirAdmin } from '@/lib/auth';
import { temChaveDeServico } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Equipe' };

export default async function Equipe() {
  const admin = await exigirAdmin();

  const supabase = await createClient();
  const { data: membros } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, ativo, avatar_url')
    .order('role')
    .order('full_name');

  const podeCriar = temChaveDeServico();

  return (
    <Pagina largura="max-w-3xl">
      <Cabecalho
        titulo="Equipe"
        descricao="Quem tem acesso ao painel. Cada pessoa troca a própria senha em Minha conta; aqui você define a primeira e resolve esquecimento."
      />

      <section className="space-y-3">
        <h2 className="font-display text-xl">
          Pessoas com acesso{' '}
          <span className="text-base font-normal text-fg-muted">({membros?.length ?? 0})</span>
        </h2>

        {membros?.length ? (
          <ul className="grid gap-3">
            {membros.map((membro) => (
              <TeamRow key={membro.id} membro={membro as Membro} euSou={admin.id} />
            ))}
          </ul>
        ) : (
          <p className="text-fg-muted">Nenhum acesso cadastrado ainda.</p>
        )}
      </section>

      {podeCriar ? (
        <TeamForm />
      ) : (
        <Cartao titulo="Criar acesso">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.7} />
            <div className="min-w-0 text-sm leading-relaxed text-fg-muted">
              <p>
                Para criar contas e definir a senha de outra pessoa daqui, falta configurar a chave
                de serviço do Supabase. É um passo único.
              </p>
              <p className="mt-2">
                O passo a passo está em <span className="font-medium text-fg">docs/acesso-ao-painel.md</span>,
                na pasta do projeto. Enquanto isso, mudar nível e suspender acesso já funciona.
              </p>
            </div>
          </div>
        </Cartao>
      )}
    </Pagina>
  );
}
