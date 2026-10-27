'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { criarMembro, type EstadoEquipe } from '@/app/actions/equipe';
import { Campo, Cartao, botao, campo } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(botao.primario, 'w-full sm:w-auto')}>
      {pending ? 'Criando…' : 'Criar acesso'}
    </button>
  );
}

export function TeamForm() {
  const [estado, acao] = useActionState<EstadoEquipe, FormData>(criarMembro, { ok: false });
  const erro = (c: string) => estado.erros?.[c];

  return (
    <Cartao
      titulo="Criar acesso"
      descricao="Cadastre a pessoa e passe a senha provisória para ela. Ela troca depois, em Minha conta."
    >
      <form action={acao} className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo nome="nome" rotulo="Nome completo" erro={erro('nome')}>
            <input
              id="nome"
              name="nome"
              required
              placeholder="Maria Souza"
              className={campo}
            />
          </Campo>

          <Campo nome="email" rotulo="E-mail de acesso" erro={erro('email')}>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="maria@amazonjetaviation.com"
              className={campo}
            />
          </Campo>

          <Campo
            nome="role"
            rotulo="Nível de acesso"
            dica="Editor mexe em cotações e no blog. Administrador também mexe em configurações e equipe."
          >
            <select id="role" name="role" defaultValue="editor" className={campo}>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </Campo>

          <Campo
            nome="senha"
            rotulo="Senha provisória"
            dica="Pelo menos 8 caracteres."
            erro={erro('senha')}
          >
            <input
              id="senha"
              name="senha"
              type="text"
              required
              minLength={8}
              autoComplete="off"
              className={campo}
            />
          </Campo>
        </div>

        {estado.mensagem ? (
          <p
            role="status"
            className={cn(
              'text-sm',
              estado.ok
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {estado.mensagem}
          </p>
        ) : null}

        <div>
          <Botao />
        </div>
      </form>
    </Cartao>
  );
}
