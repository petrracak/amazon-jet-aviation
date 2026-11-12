'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

import { identificarPn, type Identificacao } from '@/app/actions/identificar';
import type { Part } from '@/lib/types';

export type EstadoDaBusca = 'parado' | 'buscando' | 'erro';

/**
 * A busca de peça, usada pelo hero e pela página de cotação.
 *
 * O nome começa em inglês contra o resto do arquivo porque o React exige
 * isso: a regra que verifica uso de hook casa o prefixo `use` literal, e
 * `usar` não passa.
 *
 * Quem ordena e registra é o banco, na função `buscar_pecas`: casamento
 * exato do part number vem antes de "contém", e busca sem resultado fica
 * anotada para o painel mostrar o que falta no catálogo.
 *
 * O `pedido` é um contador de senha: resposta de busca antiga que chegue
 * depois de uma nova é descartada, senão o resultado do que a pessoa
 * digitou primeiro sobrescreve o do que ela digitou por último.
 *
 * Catálogo vazio não encerra o assunto: aí entra a identificação pelo
 * padrão do part number, que diz o que a peça provavelmente é. Ela vem
 * depois e só se o catálogo não respondeu — peça catalogada é informação
 * conferida, e não se troca o certo pelo provável.
 *
 * A biblioteca do Supabase entra por import dinâmico, dentro da busca.
 * Ela pesa, e na home ela só serve a quem digita um part number — a
 * maioria dos visitantes do celular rolava a página inteira carregando um
 * cliente de banco de dados que nunca ia usar. Agora ele chega junto com a
 * primeira tecla, que é quando passa a fazer falta.
 */
export function useBuscaPecas(termo: string, limite = 8) {
  const locale = useLocale();

  const [resultados, setResultados] = useState<Part[] | null>(null);
  const [estado, setEstado] = useState<EstadoDaBusca>('parado');
  const [identificacao, setIdentificacao] = useState<Identificacao | null>(null);
  const [identificando, setIdentificando] = useState(false);
  const pedido = useRef(0);

  useEffect(() => {
    const consulta = termo.trim();
    if (consulta.length < 2) {
      setResultados(null);
      setIdentificacao(null);
      setEstado('parado');
      return;
    }

    const senha = ++pedido.current;
    setEstado('buscando');

    const timer = setTimeout(async () => {
      const { createClient } = await import('@/lib/supabase/client');
      if (senha !== pedido.current) return;

      const { data, error } = await createClient().rpc('buscar_pecas', {
        p_termo: consulta,
        p_locale: locale,
        p_limite: limite,
      });

      if (senha !== pedido.current) return;

      if (error) {
        setEstado('erro');
        setResultados(null);
        setIdentificacao(null);
        return;
      }

      const achadas = (data ?? []) as Part[];
      setEstado('parado');
      setResultados(achadas);
      setIdentificacao(null);

      if (achadas.length > 0) return;

      setIdentificando(true);
      const palpite = await identificarPn(consulta);
      if (senha !== pedido.current) return;
      setIdentificando(false);
      setIdentificacao(palpite);
    }, 260);

    return () => clearTimeout(timer);
  }, [termo, locale, limite]);

  return { resultados, estado, identificacao, identificando };
}
