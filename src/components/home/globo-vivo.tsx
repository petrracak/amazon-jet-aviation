'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Globo pontilhado com a rota Estados Unidos → Brasil, desenhado em canvas.
 *
 * Ele gira, então nada pode vir com a posição de tela gravada: o que chega
 * de `public/globo-terra.json` são as coordenadas de terra do planeta em
 * longitude e latitude, do Natural Earth (domínio público, geradas por
 * `scripts/gerar-globo.mjs`), e a projeção ortográfica é refeita a cada
 * quadro. Por isso canvas e não SVG — dois mil e setecentos nós mudando de
 * lugar sessenta vezes por segundo derrubariam o DOM.
 *
 * O giro é um vaivém lento, não uma volta inteira. Numa volta completa a
 * Flórida e o Brasil passariam metade do tempo atrás da esfera, e a rota é
 * justamente o assunto da dobra. Com o vaivém o globo vive, os continentes
 * entram e saem pela borda, e os dois marcadores nunca somem.
 *
 * A esfera, o brilho e o anel da borda são gradientes CSS atrás do canvas:
 * não mudam com o giro, então não há motivo para redesenhá-los.
 */

/** Ponta da Flórida, de onde a peça sai. */
const ORIGEM = { lon: -80.19, lat: 25.76 };

/** Brasília, no meio do destino. */
const DESTINO = { lon: -47.88, lat: -15.79 };

/** Latitude do centro da vista: Américas inteiras, sem deitar o eixo. */
const LAT_CENTRO = 6;

/**
 * Vaivém da longitude do centro, em graus, e quanto dura uma ida e volta.
 *
 * O balanço é modesto por um motivo prático: cada grau desloca os
 * marcadores na horizontal, e como o globo sangra pela direita da tela, um
 * vaivém largo jogava o marcador do Brasil para fora do quadro na ponta do
 * movimento. Dez graus dão vida ao globo — os continentes andam, a borda
 * revela e esconde terra — sem levar a rota para fora.
 */
const LON_CENTRO = -68;
const BALANCO = 10;
const PERIODO = 26_000;

/** Uma viagem do avião, de ponta a ponta. */
const VOO = 7000;

/**
 * Avião visto de cima, com o bico no sentido +x. Desenhado em linhas
 * retas: num tamanho de 30px na tela, silhueta firme lê melhor que curva.
 * As medidas são para um globo de 1000 de diâmetro e escalam com ele.
 */
const AVIAO =
  'M 20 0 L 7 -3.5 L -2 -13 L -7 -13 L -3 -4 L -11 -5 L -15 -10 L -19 -10 ' +
  'L -17 -3 L -17 3 L -19 10 L -15 10 L -11 5 L -3 4 L -7 13 L -2 13 ' +
  'L 7 3.5 Z';

/** Alfinete de lugar, para o marcador do destino. */
const ALFINETE =
  'M 0 -9 C 4.6 -9 8.4 -5.2 8.4 -0.6 C 8.4 4.8 0 11 0 11 ' +
  'C 0 11 -8.4 4.8 -8.4 -0.6 C -8.4 -5.2 -4.6 -9 0 -9 Z';

const OURO = '#f0ad13';
const NOITE = '#0a1524';
const GRAU = Math.PI / 180;

/** Quantas faixas de opacidade; cada uma vira um traçado só, um preenchimento só. */
const FAIXAS = 8;

type Projetado = { x: number; y: number; z: number };

export function GloboVivo({
  origem,
  destino,
  className,
}: {
  origem: string;
  destino: string;
  className?: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const rotuloOrigem = useRef<HTMLSpanElement>(null);
  const rotuloDestino = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = tela.current;
    const moldura = caixa.current;
    if (!canvas || !moldura) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Path2D é API de navegador: construir no topo do módulo quebraria a
    // geração estática da página, que avalia este arquivo no servidor.
    const aviao = new Path2D(AVIAO);
    const alfinete = new Path2D(ALFINETE);

    let terra: Int16Array | null = null;
    let lado = 0;
    let visivel = true;
    let quadro = 0;
    let vivo = true;

    /** Reprojeta um ponto do globo para a tela, no giro atual. */
    function projetar(
      lonGrau: number,
      latGrau: number,
      lonCentro: number,
      raio: number,
      meio: number,
    ): Projetado {
      const lon = (lonGrau - lonCentro) * GRAU;
      const lat = latGrau * GRAU;
      const fi = LAT_CENTRO * GRAU;

      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const cosLon = Math.cos(lon);

      return {
        x: meio + raio * cosLat * Math.sin(lon),
        y: meio - raio * (Math.cos(fi) * sinLat - Math.sin(fi) * cosLat * cosLon),
        // Acima de zero é hemisfério da frente; o valor também dá a
        // profundidade, que encolhe e apaga o ponto perto da borda.
        z: Math.sin(fi) * sinLat + Math.cos(fi) * cosLat * cosLon,
      };
    }

    /** Some aos poucos conforme o ponto se aproxima da borda da esfera. */
    const nitidez = (z: number) => Math.max(0, Math.min(1, (z - 0.06) / 0.16));

    function desenhar(agora: number) {
      if (!ctx || !canvas) return;

      const raio = lado / 2;
      const meio = lado / 2;
      const escala = lado / 1000;

      const fase = parado ? 0 : Math.sin((agora / PERIODO) * Math.PI * 2);
      const lonCentro = LON_CENTRO + BALANCO * fase;

      ctx.clearRect(0, 0, lado, lado);

      /* ------------------------------------------------- pontos de terra */
      if (terra) {
        const trilhas: Path2D[] = [];
        for (let i = 0; i < FAIXAS; i += 1) trilhas.push(new Path2D());

        for (let i = 0; i < terra.length; i += 2) {
          const p = projetar(terra[i] / 10, terra[i + 1] / 10, lonCentro, raio, meio);
          if (p.z <= 0.005) continue;

          const faixa = Math.min(FAIXAS - 1, (p.z * FAIXAS) | 0);
          const r = (1.1 + 1.7 * p.z) * escala;
          trilhas[faixa].moveTo(p.x + r, p.y);
          trilhas[faixa].arc(p.x, p.y, r, 0, Math.PI * 2);
        }

        ctx.fillStyle = '#dde6f2';
        for (let i = 0; i < FAIXAS; i += 1) {
          ctx.globalAlpha = 0.25 + 0.6 * ((i + 0.5) / FAIXAS);
          ctx.fill(trilhas[i]);
        }
        ctx.globalAlpha = 1;
      }

      /* --------------------------------------------------------- a rota */
      const a = projetar(ORIGEM.lon, ORIGEM.lat, lonCentro, raio, meio);
      const b = projetar(DESTINO.lon, DESTINO.lat, lonCentro, raio, meio);
      const forca = Math.min(nitidez(a.z), nitidez(b.z));

      // Controle da curva: do meio do segmento, empurrado para o lado de
      // fora. É o arco de viagem, não a geodésica — ela sairia quase reta
      // nesta vista e não leria como voo.
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const cx = (a.x + b.x) / 2 + dy * 0.28;
      const cy = (a.y + b.y) / 2 - dx * 0.28;

      if (forca > 0) {
        ctx.globalAlpha = forca;
        ctx.lineWidth = 3 * escala;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);

        ctx.strokeStyle = 'rgba(240, 173, 19, 0.22)';
        ctx.stroke();

        ctx.setLineDash([12 * escala, 16 * escala]);
        ctx.lineDashOffset = parado ? 0 : -((agora / 1000) * 28 * escala);
        ctx.strokeStyle = OURO;
        ctx.stroke();
        ctx.setLineDash([]);

        /* ------------------------------------------------------ o avião */
        const t = parado ? 0.5 : (agora % VOO) / VOO;
        const u = 1 - t;
        const px = u * u * a.x + 2 * u * t * cx + t * t * b.x;
        const py = u * u * a.y + 2 * u * t * cy + t * t * b.y;
        const tx = 2 * u * (cx - a.x) + 2 * t * (b.x - cx);
        const ty = 2 * u * (cy - a.y) + 2 * t * (b.y - cy);

        // Cresce no meio da travessia e encolhe ao chegar, como se
        // subisse e descesse.
        const porte = escala * (0.75 + 0.75 * Math.sin(t * Math.PI));

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.atan2(ty, tx));
        ctx.scale(porte, porte);
        ctx.fillStyle = OURO;
        ctx.fill(aviao);
        ctx.restore();

        ctx.globalAlpha = 1;
      }

      /* --------------------------------------------------- marcadores */
      marcador(ctx, a, escala, agora, 'aviao', parado);
      marcador(ctx, b, escala, agora, 'alfinete', parado);

      /* ------------------------------------------------------ rótulos */
      posicionar(rotuloOrigem.current, a, escala, 'acima');
      posicionar(rotuloDestino.current, b, escala, 'abaixo');
    }

    function marcador(
      ctx: CanvasRenderingContext2D,
      p: Projetado,
      escala: number,
      agora: number,
      glifo: 'aviao' | 'alfinete',
      parado: boolean,
    ) {
      const forca = nitidez(p.z);
      if (forca <= 0) return;

      ctx.save();
      ctx.globalAlpha = forca;
      ctx.translate(p.x, p.y);
      ctx.scale(escala, escala);

      // Anel que pulsa: abre e apaga, e recomeça.
      const pulso = parado ? 0 : ((agora % 2600) / 2600);
      if (pulso > 0) {
        ctx.globalAlpha = forca * (1 - pulso) * 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, 19 + 16 * pulso, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = OURO;
        ctx.stroke();
        ctx.globalAlpha = forca;
      }

      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 21, 36, 0.92)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = OURO;
      ctx.stroke();

      ctx.fillStyle = OURO;
      if (glifo === 'aviao') {
        ctx.rotate(-38 * GRAU);
        ctx.scale(0.52, 0.52);
        ctx.fill(aviao);
      } else {
        ctx.translate(0, 1);
        ctx.fill(alfinete);
        ctx.beginPath();
        ctx.arc(0, -0.8, 3.1, 0, Math.PI * 2);
        ctx.fillStyle = NOITE;
        ctx.fill();
      }

      ctx.restore();
    }

    function posicionar(
      el: HTMLSpanElement | null,
      p: Projetado,
      escala: number,
      banda: 'acima' | 'abaixo',
    ) {
      if (!el) return;
      const acima = banda === 'acima';
      const desvio = acima ? -28 * escala : 28 * escala;
      // O de baixo é o do Brasil, que fica do lado do globo que sangra pela
      // borda da tela: puxar a pílula para a esquerda do marcador tira dela
      // o papel de ser a coisa mais próxima do corte.
      el.style.transform = `translate(${p.x}px, ${p.y + desvio}px) translate(${
        acima ? '-50%' : '-72%'
      }, ${acima ? '-100%' : '0'})`;
      el.style.opacity = String(nitidez(p.z));
    }

    function medir() {
      const r = moldura!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      lado = Math.round(r.width);
      canvas!.width = Math.round(lado * dpr);
      canvas!.height = Math.round(lado * dpr);
      canvas!.style.width = `${lado}px`;
      canvas!.style.height = `${lado}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function laco(agora: number) {
      if (!vivo) return;
      desenhar(agora);
      if (!parado && visivel) quadro = requestAnimationFrame(laco);
    }

    function retomar() {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(laco);
    }

    medir();

    const observador = new ResizeObserver(() => {
      medir();
      retomar();
    });
    observador.observe(moldura);

    // Fora da tela não há o que animar: poupa bateria do visitante.
    const olho = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel) retomar();
        else cancelAnimationFrame(quadro);
      },
      { rootMargin: '120px' },
    );
    olho.observe(moldura);

    fetch('/globo-terra.json')
      .then((r) => r.json())
      .then((bruto: number[]) => {
        terra = Int16Array.from(bruto);
        retomar();
      })
      .catch(() => {
        // Sem a malha o globo fica só com a esfera e a rota: menos bonito,
        // mas a dobra não quebra.
      });

    retomar();

    return () => {
      vivo = false;
      cancelAnimationFrame(quadro);
      observador.disconnect();
      olho.disconnect();
    };
  }, []);

  return (
    <div ref={caixa} className={cn('relative aspect-square', className)}>
      {/* A esfera: fundo, brilho de cima à esquerda e anel na borda. Não
          mudam com o giro, então ficam em CSS, fora do laço de desenho. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 24%, rgba(221,230,242,0.14), rgba(221,230,242,0) 46%),' +
            'radial-gradient(circle at 50% 50%, rgba(63,135,245,0) 88%, rgba(63,135,245,0.5) 100%),' +
            'radial-gradient(circle at 36% 30%, rgba(29,51,80,0.95), rgba(18,31,51,0.85) 58%, rgba(10,19,34,0.95) 100%)',
        }}
      />

      <canvas ref={tela} aria-hidden className="absolute inset-0" />

      <Rotulo ref={rotuloOrigem} texto={origem} />
      <Rotulo ref={rotuloDestino} texto={destino} />
    </div>
  );
}

/**
 * Rótulo em HTML, movido por `transform` a cada quadro: a pílula cresce com
 * o texto e o tipo fica com o mesmo desenho do resto da página, o que
 * canvas não entrega.
 */
function Rotulo({ ref, texto }: { ref: React.Ref<HTMLSpanElement>; texto: string }) {
  return (
    <span
      ref={ref}
      className={cn(
        'pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full',
        'border border-white/12 bg-night/70 px-3 py-1 text-[13px] font-medium',
        'text-mist opacity-0 backdrop-blur-sm sm:text-sm',
      )}
    >
      {texto}
    </span>
  );
}
