// Gera os contornos de EUA e Brasil a partir do Natural Earth (domínio
// público), projetados para o viewBox do mapa da rota. Roda uma vez; o que
// vai para o código é só a string do path, em mapa-paths.ts — o site em
// produção não carrega biblioteca de mapas nenhuma.
//
// As dependências não ficam no package.json, porque só servem aqui:
//   npm i --no-save world-atlas topojson-client d3-geo
//   node scripts/gerar-mapa.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';

const topo = JSON.parse(
  readFileSync('node_modules/world-atlas/countries-110m.json', 'utf8'),
);
const mundo = feature(topo, topo.objects.countries);

const achar = (nome) => mundo.features.find((f) => f.properties.name === nome);
const eua = achar('United States of America');
const brasil = achar('Brazil');

// Só o território continental: sem Alasca e Havaí, que esticariam o quadro.
const continental = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: eua.geometry.coordinates.filter((poly) => {
      const pontos = poly.flat();
      const lon = pontos.reduce((s, p) => s + p[0], 0) / pontos.length;
      const lat = pontos.reduce((s, p) => s + p[1], 0) / pontos.length;
      return lon > -130 && lon < -60 && lat > 20 && lat < 52;
    }),
  },
};

const L = 820, A = 620, M = 40;
const colecao = {
  type: 'FeatureCollection',
  features: [continental, brasil],
};

const proj = geoMercator().fitExtent([[M, M], [L - M, A - M]], colecao);
const caminho = geoPath(proj);

const arredondar = (d) => d.replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1));

const pt = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v));
const [mx, my] = pt(-80.19, 25.76);
const [bx, by] = pt(-47.88, -15.79);

const saida = `// GERADO POR scripts/gerar-mapa.mjs — não editar à mão.
//
// Contornos de Estados Unidos continentais e Brasil, vindos do Natural
// Earth (domínio público) via world-atlas, projetados em Mercator para o
// viewBox ${L}x${A} do mapa da rota. Ficam aqui como texto para o site não
// carregar biblioteca de mapas nenhuma em produção.

export const VIEW_BOX = '0 0 ${L} ${A}';

export const EUA =
  '${arredondar(caminho(continental))}';

export const BRASIL =
  '${arredondar(caminho(brasil))}';

/** Miami, FL — de onde a peça sai. */
export const ORIGEM = { x: ${mx}, y: ${my} };

/** Brasília — o destino, no meio do país. */
export const DESTINO = { x: ${bx}, y: ${by} };
`;

writeFileSync('src/components/home/mapa-paths.ts', saida);
console.log('escrito src/components/home/mapa-paths.ts');
console.log('Miami', [mx, my], 'Brasilia', [bx, by]);
