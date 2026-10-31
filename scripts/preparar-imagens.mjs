// Recorta e otimiza as imagens que o cliente manda. Roda sob demanda:
//   npm i --no-save sharp && node scripts/preparar-imagens.mjs
import sharp from 'sharp';

const ORIGEM = process.argv[2];
const SAIDA = process.argv[3];
const MARGEM = Number(process.argv[4] ?? 0.035);

/** Acha onde o conteúdo começa e termina, usando o canto como fundo. */
async function caixaDoConteudo(arquivo) {
  const img = sharp(arquivo);
  const { width: L, height: A } = await img.metadata();
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });
  const canais = data.length / (L * A);
  const fundo = [data[0], data[1], data[2]];

  let x0 = L, y0 = A, x1 = 0, y1 = 0;
  for (let y = 0; y < A; y += 2) {
    for (let x = 0; x < L; x += 2) {
      const i = (y * L + x) * canais;
      const dif =
        Math.abs(data[i] - fundo[0]) +
        Math.abs(data[i + 1] - fundo[1]) +
        Math.abs(data[i + 2] - fundo[2]);
      if (dif > 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const hex = '#' + fundo.map((c) => c.toString(16).padStart(2, '0')).join('');
  return { L, A, x0, y0, x1, y1, fundo: hex };
}

const c = await caixaDoConteudo(ORIGEM);
const mx = Math.round(c.L * MARGEM);
const my = Math.round(c.A * MARGEM);
const left = Math.max(0, c.x0 - mx);
const top = Math.max(0, c.y0 - my);
const width = Math.min(c.L - left, c.x1 - c.x0 + mx * 2);
const height = Math.min(c.A - top, c.y1 - c.y0 + my * 2);

await sharp(ORIGEM)
  .extract({ left, top, width, height })
  .webp({ quality: 88 })
  .toFile(SAIDA);

const { size } = await sharp(SAIDA).metadata();
console.log(`origem   ${c.L}x${c.A}  fundo ${c.fundo}`);
console.log(`conteudo x ${c.x0}..${c.x1}  y ${c.y0}..${c.y1}`);
console.log(`recorte  ${width}x${height} em (${left},${top})`);
console.log(`saida    ${SAIDA}  ${Math.round(size / 1024)}KB`);
