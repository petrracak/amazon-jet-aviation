// Gera o globo pontilhado da dobra "do mercado americano para o seu hangar".
//
// Sai um SVG externo (public/globo-pontos.svg) com a esfera e os pontos de
// terra, mais um módulo TS com as coordenadas já projetadas dos marcadores.
// Vetor, e não imagem: fica nítido em qualquer tamanho, e como o arquivo é
// carregado por <img> ele não engorda o HTML da página.
//
// Dependências só daqui:
//   npm i --no-save world-atlas topojson-client d3-geo
//   node scripts/gerar-globo.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoOrthographic, geoContains, geoDistance } from 'd3-geo';

const L = 1000;
const R = 455;
const CX = L / 2;
const CY = L / 2;

// Centro da vista: Atlântico ocidental, com a América do Norte em cima à
// esquerda e o Brasil embaixo à direita, como na referência.
const CENTRO = [-68, 6];

const topo = JSON.parse(
  readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'),
);
const terra = feature(topo, topo.objects.land);

const proj = geoOrthographic()
  .scale(R)
  .translate([CX, CY])
  .rotate([-CENTRO[0], -CENTRO[1]])
  .clipAngle(90);

/** Pontos espaçados por igual na esfera, mantidos só onde há terra. */
function pontos() {
  const passo = 2.1;
  const fora = [];

  for (let lat = -88; lat <= 88; lat += passo) {
    // Em latitude alta os meridianos se aproximam; alargar o passo em
    // longitude mantém a malha com espaçamento parecido na tela.
    const passoLon = passo / Math.max(0.18, Math.cos((lat * Math.PI) / 180));

    for (let lon = -180; lon < 180; lon += passoLon) {
      if (!geoContains(terra, [lon, lat])) continue;

      // clipAngle vale para caminhos, não para ponto projetado um a um:
      // sem este corte o lado de trás da esfera seria desenhado por cima
      // do da frente. 1.48 rad ~ 85 graus, que já descarta a borda rasa.
      if (geoDistance([lon, lat], CENTRO) > 1.48) continue;

      const p = proj([lon, lat]);
      if (!p) continue;

      const [x, y] = p;
      const d = Math.hypot(x - CX, y - CY) / R;
      if (d > 0.995) continue;

      // Perto da borda o ponto encolhe e apaga: é o que dá volume.
      const z = Math.sqrt(Math.max(0, 1 - d * d));
      fora.push({
        x: +x.toFixed(1),
        y: +y.toFixed(1),
        r: +(1.1 + 1.7 * z).toFixed(2),
        o: +(0.25 + 0.6 * z).toFixed(2),
      });
    }
  }
  return fora;
}

const pts = pontos();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${L}" width="${L}" height="${L}">
<defs>
<radialGradient id="esfera" cx="36%" cy="30%" r="78%">
<stop offset="0%" stop-color="#1d3350" stop-opacity="0.95"/>
<stop offset="58%" stop-color="#121f33" stop-opacity="0.85"/>
<stop offset="100%" stop-color="#0a1322" stop-opacity="0.95"/>
</radialGradient>
<radialGradient id="borda" cx="50%" cy="50%" r="50%">
<stop offset="88%" stop-color="#3f87f5" stop-opacity="0"/>
<stop offset="100%" stop-color="#3f87f5" stop-opacity="0.5"/>
</radialGradient>
<radialGradient id="brilho" cx="32%" cy="24%" r="46%">
<stop offset="0%" stop-color="#dde6f2" stop-opacity="0.14"/>
<stop offset="100%" stop-color="#dde6f2" stop-opacity="0"/>
</radialGradient>
</defs>
<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#esfera)"/>
<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#brilho)"/>
<g fill="#dde6f2">
${pts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" opacity="${p.o}"/>`).join('')}
</g>
<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#borda)"/>
</svg>
`;

writeFileSync('public/globo-pontos.svg', svg);

const ponto = (lon, lat) => {
  const [x, y] = proj([lon, lat]);
  return { x: Math.round(x), y: Math.round(y) };
};

const eua = ponto(-80.19, 25.76); // Miami, na ponta da Flórida
const brasil = ponto(-47.88, -15.79); // Brasília, no meio do país

writeFileSync(
  'src/components/home/globo-pontos.ts',
  `// GERADO POR scripts/gerar-globo.mjs — não editar à mão.
//
// Coordenadas dos marcadores já projetadas no mesmo globo de
// public/globo-pontos.svg, que é desenhado em ortográfica centrada em
// ${CENTRO[0]}°, ${CENTRO[1]}°.

export const VIEW_BOX = '0 0 ${L} ${L}';
export const RAIO = ${R};
export const CENTRO = { x: ${CX}, y: ${CY} };

/** Flórida: de onde a peça sai. */
export const ORIGEM = { x: ${eua.x}, y: ${eua.y} };

/** Brasil: o destino. */
export const DESTINO = { x: ${brasil.x}, y: ${brasil.y} };
`,
);

console.log(`globo: ${pts.length} pontos`);
console.log(`origem  ${eua.x},${eua.y}`);
console.log(`destino ${brasil.x},${brasil.y}`);
console.log(`svg     ${Math.round(svg.length / 1024)}KB`);
