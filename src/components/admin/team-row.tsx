'use client';

import { KeyRound, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { alterarPapel, alterarSituacao, definirSenhaDe } from '@/app/actions/equipe';
import { Avatar } from '@/components/admin/avatar';
import { Selo, botao, campo } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export type Membro = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'admin' | 'editor';
  ativo: boolean;
  avatar_url: string | null;
};

export function TeamRow({ membro, euSou }: { membro: Membro; euSou: string }) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  const [abrirSenha, setAbrirSenha] = useState(false);
  const [senha, setSenha] = useState('');
  const [recado, setRecado] = useState<{ ok: boolean; texto: string } | null>(null);

  const souEu = membro.id === euSou;
  const nome = membro.full_name ?? 'Sem nome';

  function rodar(acao: () => Promise<{ ok: boolean; mensagem?: string }>) {
    startTransition(async () => {
      const r = await acao();
      setRecado({ ok: r.ok, texto: r.mensagem ?? '' });
      router.refresh();
    });
  }

  return (
    <li
      className={cn(
        'rounded-2xl border border-border-base bg-bg-elevated p-4 shadow-[var(--shadow-card)] transition-opacity',
        pendente && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar url={membro.avatar_url} nome={nome} tamanho="sm" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium">
            {nome}
            {souEu ? <span className="ml-2 text-sm text-fg-muted">(você)</span> : null}
          </p>
          <p className="truncate text-sm text-fg-muted">{membro.email}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Selo tom={membro.role === 'admin' ? 'azul' : 'cinza'}>
            {membro.role === 'admin' ? 'Administrador' : 'Editor'}
          </Selo>
          {!membro.ativo ? <Selo tom="ambar">Suspenso</Selo> : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAbrirSenha((v) => !v)}
          className={cn(botao.secundario, 'min-h-10 px-4 text-sm')}
        >
          <KeyRound className="size-4" strokeWidth={1.7} />
          Definir senha
        </button>

        {!souEu ? (
          <>
            <button
              type="button"
              onClick={() =>
                rodar(() => alterarPapel(membro.id, membro.role === 'admin' ? 'editor' : 'admin'))
              }
              className={cn(botao.suave, 'min-h-10 px-4 text-sm')}
            >
              <MoreVertical className="size-4" strokeWidth={1.7} />
              {membro.role === 'admin' ? 'Tornar editor' : 'Tornar administrador'}
            </button>

            <button
              type="button"
              onClick={() => rodar(() => alterarSituacao(membro.id, !membro.ativo))}
              className={cn(
                membro.ativo ? botao.perigo : botao.suave,
                'min-h-10 px-4 text-sm',
              )}
            >
              {membro.ativo ? 'Suspender acesso' : 'Reativar acesso'}
            </button>
          </>
        ) : null}
      </div>

      {abrirSenha ? (
        <div className="mt-4 rounded-xl bg-bg-subtle p-4">
          <label htmlFor={`senha-${membro.id}`} className="block text-sm font-medium">
            Senha provisória
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              id={`senha-${membro.id}`}
              type="text"
              value={senha}
              minLength={8}
              autoComplete="off"
              onChange={(e) => setSenha(e.target.value)}
              placeholder="pelo menos 8 caracteres"
              className={cn(campo, 'flex-1 basis-56')}
            />
            <button
              type="button"
              disabled={senha.length < 8}
              onClick={() =>
                rodar(async () => {
                  const r = await definirSenhaDe(membro.id, senha);
                  if (r.ok) {
                    setSenha('');
                    setAbrirSenha(false);
                  }
                  return r;
                })
              }
              className={cn(botao.primario, 'mt-1.5 min-h-12')}
            >
              Salvar senha
            </button>
          </div>
        </div>
      ) : null}

      {recado?.texto ? (
        <p
          role="status"
          className={cn(
            'mt-3 text-sm',
            recado.ok
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-red-600 dark:text-red-400',
          )}
        >
          {recado.texto}
        </p>
      ) : null}
    </li>
  );
}
