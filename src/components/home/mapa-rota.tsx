import { BRASIL, DESTINO, EUA, ORIGEM, VIEW_BOX } from './mapa-paths';

/**
 * Mapa da rota Estados Unidos → Brasil, em SVG.
 *
 * Os contornos dos dois países vêm do Natural Earth, domínio público, já
 * projetados em Mercator e gravados como texto em `mapa-paths.ts` por
 * `scripts/gerar-mapa.mjs`. Em produção não entra biblioteca de mapas
 * nenhuma: é um SVG e algumas regras de CSS.
 *
 * Miami e Brasília estão nas coordenadas reais delas, projetadas pelo mesmo
 * cálculo — a rota desenhada é a rota de verdade.
 *
 * O SVG é transparente de propósito: a malha de pontos e o brilho ficam na
 * seção, para não existir borda de quadro em volta do mapa.
 *
 * O avião anda pelo `offset-path`, que recebe exatamente o mesmo `d` da
 * linha, então os dois nunca saem de sincronia. Toda a animação é CSS, e o
 * `prefers-reduced-motion` do site já congela tudo.
 */

const ROTA = `M ${ORIGEM.x} ${ORIGEM.y} C ${ORIGEM.x + 118} ${ORIGEM.y + 26} ${
  DESTINO.x + 42
} ${DESTINO.y - 150} ${DESTINO.x} ${DESTINO.y}`;

/**
 * Avião visto de cima, com o bico no sentido +x — que é para onde o
 * `offset-rotate: auto` aponta. Desenhado em linhas retas: num tamanho de
 * 30px na tela, silhueta firme lê melhor que curva.
 */
const AVIAO =
  'M 20 0 L 7 -3.5 L -2 -13 L -7 -13 L -3 -4 L -11 -5 L -15 -10 L -19 -10 ' +
  'L -17 -3 L -17 3 L -19 10 L -15 10 L -11 5 L -3 4 L -7 13 L -2 13 ' +
  'L 7 3.5 Z';

export function MapaRota({
  origem,
  destino,
  className,
}: {
  origem: string;
  destino: string;
  className?: string;
}) {
  return (
    <svg viewBox={VIEW_BOX} aria-hidden className={className ?? 'h-auto w-full'}>
      <defs>
        <linearGradient id="terra-rota" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dde6f2" stopOpacity="0.17" />
          <stop offset="100%" stopColor="#dde6f2" stopOpacity="0.06" />
        </linearGradient>
      </defs>

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

      {/* Dois grupos: o de fora anda e gira pelo offset-path, o de dentro
          só cresce e encolhe. Separar evita que uma transformação atropele
          a outra. */}
      <g className="aviao-rota" style={{ offsetPath: `path("${ROTA}")` }}>
        <g className="aviao-escala">
          <path d={AVIAO} fill="#f0ad13" />
        </g>
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
