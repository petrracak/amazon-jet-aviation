'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

import { createClient } from '@/lib/supabase/client';
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
 */
export function useBuscaPecas(termo: string, limite = 8) {
  const locale = useLocale();
  const supabase = useMemo(() => createClient(), []);

  const [resultados, setResultados] = useState<Part[] | null>(null);
  const [estado, setEstado] = useState<EstadoDaBusca>('parado');
  const pedido = useRef(0);

  useEffect(() => {
    const consulta = termo.trim();
    if (consulta.length < 2) {
      setResultados(null);
      setEstado('parado');
      return;
    }

    const senha = ++pedido.current;
    setEstado('buscando');

    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc('buscar_pecas', {
        p_termo: consulta,
        p_locale: locale,
        p_limite: limite,
      });

      if (senha !== pedido.current) return;

      if (error) {
        setEstado('erro');
        setResultados(null);
        return;
      }

      setEstado('parado');
      setResultados((data ?? []) as Part[]);
    }, 260);

    return () => clearTimeout(timer);
  }, [termo, locale, limite, supabase]);

  return { resultados, estado };
}
