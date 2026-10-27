import { BRASIL, DESTINO, EUA, ORIGEM, VIEW_BOX } from './mapa-paths';

/**
 * Mapa da rota Estados Unidos → Brasil, em SVG.
 *
 * Os contornos dos dois países vêm do Natural Earth, domínio público, já
 * projetados em Mercator e gravados como texto em `mapa-paths.ts` por
 * `scripts/gerar-mapa.mjs`. Em produção não entra biblioteca de mapas
 * nenhuma: é um SVG e duas regras de CSS.
 *
 * Miami e Brasília estão nas coordenadas reais delas, projetadas pelo mesmo
 * cálculo — a rota desenhada é a rota de verdade.
 *
 * O avião anda pelo `offset-path`, que recebe exatamente o mesmo `d` da
 * linha, então os dois nunca saem de sincronia. Toda a animação é CSS, e o
 * `prefers-reduced-motion` do site já congela tudo.
 */

const ROTA = `M ${ORIGEM.x} ${ORIGEM.y} C ${ORIGEM.x + 118} ${ORIGEM.y + 26} ${
  DESTINO.x + 42
} ${DESTINO.y - 150} ${DESTINO.x} ${DESTINO.y}`;

export function MapaRota({ origem, destino }: { origem: string; destino: string }) {
  return (
    <svg
      viewBox={VIEW_BOX}
      role="img"
      aria-label={`Mapa da rota de ${origem} até ${destino}`}
      className="h-auto w-full"
    >
      <defs>
        <radialGradient id="brilho-rota" cx="52%" cy="48%" r="58%">
          <stop offset="0%" stopColor="#3f87f5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3f87f5" stopOpacity="0" />
        </radialGradient>

        <pattern id="malha-rota" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#dde6f2" opacity="0.12" />
        </pattern>

        <linearGradient id="terra-rota" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dde6f2" stopOpacity="0.17" />
          <stop offset="100%" stopColor="#dde6f2" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#brilho-rota)" />
      <rect width="100%" height="100%" fill="url(#malha-rota)" />

      <g
        fill="url(#terra-rota)"
        stroke="#93a6bd"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        strokeLinejoin="round"
      >
        <path d={EUA} />
        <path d={BRASIL} />
      </g>

      {/* A rota: um traço contínuo de base e, por cima, o tracejado que
          corre no sentido da viagem. */}
      <path d={ROTA} fill="none" stroke="#f0ad13" strokeOpacity="0.25" strokeWidth="2.5" />
      <path
        d={ROTA}
        fill="none"
        stroke="#f0ad13"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="10 14"
        className="rota-correndo"
      />

      <Ponto {...ORIGEM} rotulo={origem} ancora="end" deslocamento={-14} />
      <Ponto {...DESTINO} rotulo={destino} ancora="start" deslocamento={16} />

      {/* offset-rotate: auto faz o bico acompanhar a curva. */}
      <g className="aviao-rota" style={{ offsetPath: `path("${ROTA}")` }}>
        <path
          d="M 14 0 L -10 -8 L -4 0 L -10 8 Z"
          fill="#f0ad13"
          stroke="#f0ad13"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function Ponto({
  x,
  y,
  rotulo,
  ancora,
  deslocamento,
}: {
  x: number;
  y: number;
  rotulo: string;
  ancora: 'start' | 'end';
  deslocamento: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r="7" fill="#f0ad13" fillOpacity="0.3" className="ponto-pulso" />
      <circle cx={x} cy={y} r="4.5" fill="#f0ad13" />
      <text
        x={x + deslocamento}
        y={y - 15}
        textAnchor={ancora}
        className="fill-white font-display text-[24px] font-semibold"
      >
        {rotulo}
      </text>
    </g>
  );
}
