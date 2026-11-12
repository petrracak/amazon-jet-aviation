// Converte as fotos do site para WebP no tamanho em que são exibidas.
//
// O otimizador de imagem da Vercel está desligado (a cota da conta
// esgotou e ele passou a devolver 402), então o arquivo que entra no
// repositório é exatamente o que o visitante baixa. Se ele vem em 3000px
// e JPEG, é isso que vai pelo celular de quem está no 4G.
//
//   node scripts/otimizar-fotos.mjs
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

/**
 * Largura máxima por arquivo, medida no uso real.
 *
 * Fundo decorativo aguenta menos qualidade porque entra a 30% de opacidade
 * atrás de texto; foto de conteúdo precisa de mais, e o lockup precisa de
 * canal alfa e de borda limpa.
 */
const REGRAS = [
  { casa: /volta-ao-mundo-fundo/, largura: 1600, qualidade: 58 },
  { casa: /voltaaomundo\.png$/, largura: 760, qualidade: 82 },
  { casa: /^blog\//, largura: 1200, qualidade: 72 },
  { casa: /./, largura: 1400, qualidade: 72 },
];

const PASTAS = ['public/fotos', 'public/blog'];

const regraDe = (rel) => REGRAS.find((r) => r.casa.test(rel)) ?? REGRAS.at(-1);

let antes = 0;
let depois = 0;

for (const pasta of PASTAS) {
  for (const nome of await readdir(pasta)) {
    const ext = extname(nome).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const entrada = join(pasta, nome);
    const rel = `${basename(pasta)}/${nome}`;
    const { largura, qualidade } = regraDe(rel);
    const saida = join(pasta, `${basename(nome, ext)}.webp`);

    const tamanhoAntes = (await stat(entrada)).size;
    const temp = `${saida}.tmp`;

    const info = await sharp(entrada)
      // `withoutEnlargement` para nunca esticar um arquivo que já é menor
      // que o alvo: isso só aumentaria o peso sem ganhar nitidez.
      .resize({ width: largura, withoutEnlargement: true })
      .webp({ quality: qualidade })
      .toFile(temp);

    await rename(temp, saida);
    if (entrada !== saida) await unlink(entrada);

    antes += tamanhoAntes;
    depois += info.size;

    const corte = ((1 - info.size / tamanhoAntes) * 100).toFixed(0);
    console.log(
      `  ${rel.padEnd(62)} ${(tamanhoAntes / 1024).toFixed(0).padStart(5)} KB -> ` +
        `${(info.size / 1024).toFixed(0).padStart(4)} KB  (-${corte}%)  ${info.width}px`,
    );
  }
}

console.log(
  `\n  total: ${(antes / 1024 / 1024).toFixed(2)} MB -> ${(depois / 1024 / 1024).toFixed(2)} MB` +
    `  (-${((1 - depois / antes) * 100).toFixed(0)}%)`,
);
