import { cn } from '@/lib/utils';

import { DESTINO, ORIGEM, VIEW_BOX } from './globo-pontos';

/**
 * Globo pontilhado com a rota Estados Unidos → Brasil.
 *
 * A esfera e os pontos de terra moram em `public/globo-pontos.svg`, gerado
 * por `scripts/gerar-globo.mjs` a partir do Natural Earth (domínio público),
 * em projeção ortográfica centrada no Atlântico ocidental. Vem por <img>:
 * continua vetor, fica em cache e não joga mil círculos dentro do HTML.
 *
 * Por cima entra este SVG, pequeno, com a rota e os marcadores — e os
 * rótulos em HTML, para ficarem com a mesma tipografia do resto do site.
 *
 * A Flórida e o Brasil estão nas coordenadas reais deles, projetadas pelo
 * mesmo cálculo da esfera. O avião anda pelo `offset-path`, que recebe o
 * mesmo `d` da linha: os dois nunca saem de sincronia. Toda a animação é
 * CSS, e o `prefers-reduced-motion` do site já congela tudo.
 */

/** Arco da viagem: sobe pelo Atlântico em vez de cortar reto o continente. */
const ROTA = `M ${ORIGEM.x} ${ORIGEM.y} C ${ORIGEM.x + 128} ${ORIGEM.y + 20} ${
  DESTINO.x + 58
} ${DESTINO.y - 156} ${DESTINO.x} ${DESTINO.y}`;

/**
 * Avião visto de cima, com o bico no sentido +x — que é para onde o
 * `offset-rotate: auto` aponta. Desenhado em linhas retas: num tamanho de
 * 30px na tela, silhueta firme lê melhor que curva.
 */
const AVIAO =
  'M 20 0 L 7 -3.5 L -2 -13 L -7 -13 L -3 -4 L -11 -5 L -15 -10 L -19 -10 ' +
  'L -17 -3 L -17 3 L -19 10 L -15 10 L -11 5 L -3 4 L -7 13 L -2 13 ' +
  'L 7 3.5 Z';

/** Alfinete de lugar, para o marcador do destino. */
const ALFINETE =
  'M 0 -9 C 4.6 -9 8.4 -5.2 8.4 -0.6 C 8.4 4.8 0 11 0 11 ' +
  'C 0 11 -8.4 4.8 -8.4 -0.6 C -8.4 -5.2 -4.6 -9 0 -9 Z';

/** Posição em porcentagem da caixa, que é quadrada como o viewBox. */
const emPorcento = (v: number) => `${(v / 10).toFixed(2)}%`;

export function GloboRota({
  origem,
  destino,
  className,
}: {
  origem: string;
  destino: string;
  className?: string;
}) {
  return (
    <div className={cn('relative size-full', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/globo-pontos.svg"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full"
      />

      <svg viewBox={VIEW_BOX} aria-hidden className="absolute inset-0 size-full overflow-visible">
        {/* A rota: um traço contínuo de base e, por cima, o tracejado que
            corre no sentido da viagem. */}
        <path d={ROTA} fill="none" stroke="#f0ad13" strokeOpacity="0.22" strokeWidth="3" />
        <path
          d={ROTA}
          fill="none"
          stroke="#f0ad13"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 16"
          className="rota-correndo"
        />

        <Marcador {...ORIGEM} glifo="aviao" />
        <Marcador {...DESTINO} glifo="alfinete" />

        {/* Dois grupos: o de fora anda e gira pelo offset-path, o de dentro
            só cresce e encolhe. Separar evita que uma transformação atropele
            a outra. */}
        <g className="aviao-rota" style={{ offsetPath: `path("${ROTA}")` }}>
          <g className="aviao-escala">
            <g transform="scale(1.35)">
              <path d={AVIAO} fill="#f0ad13" />
            </g>
          </g>
        </g>
      </svg>

      <Rotulo x={ORIGEM.x} y={ORIGEM.y} texto={origem} lado="acima" />
      <Rotulo x={DESTINO.x} y={DESTINO.y} texto={destino} lado="abaixo" />
    </div>
  );
}

/** Disco escuro com anel dourado e um glifo dentro, como na referência. */
function Marcador({ x, y, glifo }: { x: number; y: number; glifo: 'aviao' | 'alfinete' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="30" fill="none" stroke="#f0ad13" strokeWidth="2" className="ponto-pulso" />
      <circle r="19" fill="#0a1524" fillOpacity="0.92" stroke="#f0ad13" strokeWidth="2.5" />
      {glifo === 'aviao' ? (
        <g transform="rotate(-38) scale(0.52)">
          <path d={AVIAO} fill="#f0ad13" />
        </g>
      ) : (
        <g transform="translate(0 1)">
          <path d={ALFINETE} fill="#f0ad13" />
          <circle cy="-0.8" r="3.1" fill="#0a1524" />
        </g>
      )}
    </g>
  );
}

/**
 * Rótulo em HTML, ancorado num ponto de tamanho zero sobre o marcador: a
 * pílula cresce com o texto e o tipo fica com o mesmo desenho do resto da
 * página, o que SVG não entrega.
 */
function Rotulo({
  x,
  y,
  texto,
  lado,
}: {
  x: number;
  y: number;
  texto: string;
  lado: 'acima' | 'abaixo';
}) {
  return (
    <div className="absolute size-0" style={{ left: emPorcento(x), top: emPorcento(y) }}>
      <span
        className={cn(
          'absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/12',
          'bg-night/70 px-3 py-1 text-[13px] font-medium text-mist backdrop-blur-sm sm:text-sm',
          lado === 'acima' ? 'bottom-7' : 'top-7',
        )}
      >
        {texto}
      </span>
    </div>
  );
}
