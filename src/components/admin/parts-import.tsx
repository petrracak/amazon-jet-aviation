'use client';

import { Check, FileUp, Loader2, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

import { importarPecas, type RelatorioImportacao } from '@/app/actions/pecas';
import { Cartao, botao } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

/**
 * O carregador do catálogo.
 *
 * O arquivo é lido no navegador e só o texto vai para o servidor: planilha
 * de fornecedor passa de dez mil linhas, e subir o arquivo inteiro para
 * depois ler daria o mesmo resultado por um caminho mais longo.
 */
export function PartsImport() {
  const router = useRouter();
  const campo = useRef<HTMLInputElement>(null);
  const [pendente, startTransition] = useTransition();
  const [relatorio, setRelatorio] = useState<RelatorioImportacao | null>(null);
  const [arquivo, setArquivo] = useState<string | null>(null);

  function enviar(file: File) {
    setArquivo(file.name);
    setRelatorio(null);

    file.text().then((texto) => {
      startTransition(async () => {
        setRelatorio(await importarPecas(texto));
        router.refresh();
      });
    });
  }

  return (
    <Cartao
      titulo="Carregar catálogo"
      descricao="Um CSV com uma linha por peça. Rodar o mesmo arquivo de novo não duplica nada: o part number manda, e o que já existe é atualizado."
    >
      <input
        ref={campo}
        type="file"
        accept=".csv,text/csv,text/plain"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) enviar(f);
          e.target.value = '';
        }}
      />

      <button
        type="button"
        disabled={pendente}
        onClick={() => campo.current?.click()}
        className={cn(botao.primario, 'min-h-12')}
      >
        {pendente ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={1.7} />
        ) : (
          <FileUp className="size-4" strokeWidth={1.7} />
        )}
        {pendente ? 'Carregando...' : 'Escolher arquivo CSV'}
      </button>

      {arquivo ? (
        <p className="mt-3 truncate text-sm text-fg-muted">{arquivo}</p>
      ) : null}

      {relatorio ? (
        <div
          className={cn(
            'mt-4 rounded-xl border p-4 text-sm leading-relaxed',
            relatorio.ok
              ? 'border-emerald-500/30 bg-emerald-500/8'
              : 'border-red-500/30 bg-red-500/8',
          )}
        >
          <p className="flex items-center gap-2 font-medium">
            {relatorio.ok ? (
              <Check className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            ) : (
              <TriangleAlert className="size-4 text-red-600 dark:text-red-400" strokeWidth={1.8} />
            )}
            {relatorio.ok
              ? `${relatorio.gravadas} de ${relatorio.lidas} peças no catálogo.`
              : 'Não deu para carregar.'}
          </p>

          {relatorio.ignoradas > 0 ? (
            <p className="mt-1 text-fg-muted">
              {relatorio.ignoradas} linha(s) sem part number foram puladas.
            </p>
          ) : null}

          {relatorio.erros.length > 0 ? (
            <ul className="mt-2 space-y-1 text-fg-muted">
              {relatorio.erros.map((erro) => (
                <li key={erro}>{erro}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <details className="mt-5 text-sm">
        <summary className="cursor-pointer text-fg-muted hover:text-fg">
          Como o arquivo precisa estar
        </summary>
        <div className="mt-3 space-y-3 text-fg-muted">
          <p>
            A primeira linha é o cabeçalho. Só <strong className="text-fg">pn</strong> é
            obrigatório; o resto entra se existir, em português ou inglês.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-bg-subtle p-3 text-xs leading-relaxed">
{`pn,nome,descricao,fabricante,categoria
4004508-0001,Fuel Control Unit,Para PT6A-67,Honeywell,Motor
LW-12417,Oil Filter Element,Lycoming O-320/O-360,Lycoming,Filtro`}
          </pre>
          <p>
            Separador vírgula ou ponto e vírgula, tanto faz — planilha salva no Excel em
            português costuma usar ponto e vírgula e também funciona.
          </p>
        </div>
      </details>
    </Cartao>
  );
}
