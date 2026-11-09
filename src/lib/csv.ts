/**
 * Leitor de CSV para a carga do catálogo de peças.
 *
 * Fica fora da action de propósito: é a parte com regra de verdade — aspas,
 * quebra de linha dentro do campo, separador que muda conforme o programa
 * que salvou o arquivo — e separada dá para testar sem servidor nem login.
 */

/**
 * Lê CSV com aspas, quebra de linha dentro do campo e separador `,` ou `;`.
 * Planilha salva no Excel em português sai com ponto e vírgula, então
 * adivinhar o separador evita que metade dos arquivos chegue como uma
 * coluna só.
 */
export function lerCsv(texto: string): string[][] {
  const limpo = (texto ?? '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');

  const quebra = limpo.indexOf('\n');
  const cabecalho = quebra >= 0 ? limpo.slice(0, quebra) : limpo;
  const separador =
    (cabecalho.match(/;/g)?.length ?? 0) > (cabecalho.match(/,/g)?.length ?? 0) ? ';' : ',';

  const linhas: string[][] = [];
  let campo = '';
  let linha: string[] = [];
  let entreAspas = false;

  for (let i = 0; i < limpo.length; i += 1) {
    const c = limpo[i];

    if (entreAspas) {
      if (c === '"') {
        if (limpo[i + 1] === '"') {
          campo += '"';
          i += 1;
        } else {
          entreAspas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') entreAspas = true;
    else if (c === separador) {
      linha.push(campo);
      campo = '';
    } else if (c === '\n') {
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = '';
    } else campo += c;
  }

  if (campo !== '' || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }

  return linhas.filter((l) => l.some((v) => v.trim() !== ''));
}

/** Nomes de coluna aceitos, em português e inglês. */
export const COLUNAS: Record<string, string[]> = {
  pn: ['pn', 'part number', 'partnumber', 'part_number', 'peca', 'peça', 'codigo', 'código'],
  name: ['nome', 'name', 'descricao curta', 'titulo', 'título', 'item'],
  description: ['descricao', 'descrição', 'description', 'detalhes', 'observacao', 'observação'],
  manufacturer: ['fabricante', 'manufacturer', 'marca', 'brand', 'maker'],
  category: ['categoria', 'category', 'grupo', 'tipo'],
};

export const semAcento = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Diz em que posição cada campo caiu, a partir da linha de cabeçalho. */
export function mapearColunas(cabecalho: string[]): Record<string, number> {
  const normalizado = cabecalho.map(semAcento);
  const onde: Record<string, number> = {};
  for (const [campo, nomes] of Object.entries(COLUNAS)) {
    const i = normalizado.findIndex((c) => nomes.includes(c));
    if (i >= 0) onde[campo] = i;
  }
  return onde;
}
