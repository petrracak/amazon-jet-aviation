// Gera a malha de pontos de terra do globo da dobra "do mercado americano
// para o seu hangar".
//
// Sai um só arquivo: public/globo-terra.json, com as coordenadas de todos
// os pontos de terra do planeta em longitude/latitude. Quem projeta e
// desenha é o componente, quadro a quadro, porque o globo gira — não dá
// para gravar a posição na tela de antemão.
//
// Os números vão como inteiros em décimos de grau e num array achatado:
// JSON com objetos ficaria três vezes maior para a mesma informação.
//
// Dependências só daqui:
//   npm i --no-save world-atlas topojson-client d3-geo
//   node scripts/gerar-globo.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

/** Espaçamento da malha, em graus. Menos que isso vira mancha. */
const PASSO = 2.1;

const topo = JSON.parse(
  readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'),
);
const terra = feature(topo, topo.objects.land);

const pontos = [];

for (let lat = -88; lat <= 88; lat += PASSO) {
  // Em latitude alta os meridianos se aproximam; alargar o passo em
  // longitude mantém a malha com espaçamento parecido na tela.
  const passoLon = PASSO / Math.max(0.18, Math.cos((lat * Math.PI) / 180));

  for (let lon = -180; lon < 180; lon += passoLon) {
    if (!geoContains(terra, [lon, lat])) continue;
    pontos.push(Math.round(lon * 10), Math.round(lat * 10));
  }
}

const json = JSON.stringify(pontos);
writeFileSync('public/globo-terra.json', json);

console.log(`globo: ${pontos.length / 2} pontos`);
console.log(`json:   ${Math.round(json.length / 1024)}KB`);
