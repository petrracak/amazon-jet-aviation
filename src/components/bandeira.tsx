/**
 * As bandeiras do seletor de idioma, desenhadas à mão em SVG.
 *
 * São três, num tamanho fixo e pequeno: biblioteca de ícones de bandeira
 * traria centenas de arquivos para usar estes. O desenho é simplificado de
 * propósito — a 21 por 15 pixels, estrela e brasão viram sujeira.
 *
 * O anel claro em volta existe porque o branco da bandeira dos Estados
 * Unidos se perderia no cabeçalho escuro sem ele.
 */

type Pais = 'pt' | 'en' | 'es';

export function Bandeira({ pais, className }: { pais: Pais; className?: string }) {
  return (
    <svg
      viewBox="0 0 21 15"
      width="21"
      height="15"
      aria-hidden
      className={className}
      shapeRendering="crispEdges"
    >
      <defs>
        <clipPath id={`recorte-${pais}`}>
          <rect x="0" y="0" width="21" height="15" rx="2.5" />
        </clipPath>
      </defs>

      <g clipPath={`url(#recorte-${pais})`}>
        {pais === 'pt' ? <Brasil /> : null}
        {pais === 'en' ? <EstadosUnidos /> : null}
        {pais === 'es' ? <Espanha /> : null}
      </g>

      <rect
        x="0.5"
        y="0.5"
        width="20"
        height="14"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
    </svg>
  );
}

function Brasil() {
  return (
    <>
      <rect width="21" height="15" fill="#009b3a" />
      <path d="M10.5 1.8 19.2 7.5 10.5 13.2 1.8 7.5Z" fill="#fedf00" />
      <circle cx="10.5" cy="7.5" r="3.1" fill="#002776" />
    </>
  );
}

function EstadosUnidos() {
  return (
    <>
      <rect width="21" height="15" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={(y * 15) / 13} width="21" height={15 / 13} fill="#b22234" />
      ))}
      <rect width="9" height={(7 * 15) / 13} fill="#3c3b6e" />
    </>
  );
}

function Espanha() {
  return (
    <>
      <rect width="21" height="15" fill="#aa151b" />
      <rect y="3.75" width="21" height="7.5" fill="#f1bf00" />
    </>
  );
}
