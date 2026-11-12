'use client';

import { useEffect, useRef } from 'react';

/**
 * O brilho que segue o cursor na primeira dobra.
 *
 * O site antigo tinha este efeito e o cliente gostou dele. A ideia é a
 * mesma; a execução é outra, em três pontos:
 *
 * - Lá o brilho era movido por `left` e `top` a cada `mousemove`, o que
 *   obriga o navegador a recalcular layout em todo quadro. Aqui é
 *   `transform`, que fica na composição e não toca no layout.
 * - Lá o brilho grudava no cursor. Aqui ele persegue com atraso curto,
 *   aproximando-se um pouco a cada quadro. É o que separa a sensação de
 *   peso da de adesivo colado no ponteiro.
 * - Lá o efeito morria no celular, onde não existe cursor. Aqui, sem
 *   ponteiro fino, o brilho vagueia sozinho devagar, e a dobra continua
 *   viva.
 *
 * Quem pediu menos movimento no sistema recebe o brilho parado no centro:
 * o clima permanece, a perseguição não.
 */
export function BrilhoCursor() {
  const brilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = brilho.current;
    const area = el?.parentElement;
    if (!el || !area) return;

    const parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const temPonteiro = window.matchMedia('(pointer: fine)').matches;

    const medida = () => area.getBoundingClientRect();
    let caixa = medida();

    let alvoX = caixa.width * 0.5;
    let alvoY = caixa.height * 0.42;
    let x = alvoX;
    let y = alvoY;
    let quadro = 0;
    let vivo = true;

    const desenhar = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    if (parado) {
      desenhar();
      el.style.opacity = '0.75';
      return;
    }

    const inicio = performance.now();

    const laco = (agora: number) => {
      if (!vivo) return;

      if (!temPonteiro) {
        // Sem cursor, o brilho faz uma volta lenta e larga pela dobra.
        const t = (agora - inicio) / 1000;
        alvoX = caixa.width * (0.5 + 0.26 * Math.sin(t / 7));
        alvoY = caixa.height * (0.44 + 0.16 * Math.sin(t / 11));
      }

      // Aproximação por fração constante: rápido quando está longe,
      // suave ao chegar.
      x += (alvoX - x) * 0.07;
      y += (alvoY - y) * 0.07;
      desenhar();

      quadro = requestAnimationFrame(laco);
    };

    const aoMover = (e: PointerEvent) => {
      caixa = medida();
      alvoX = e.clientX - caixa.left;
      alvoY = e.clientY - caixa.top;
      el.style.opacity = '1';
    };

    const aoSair = () => {
      el.style.opacity = '0';
    };

    const aoRedimensionar = () => {
      caixa = medida();
    };

    el.style.opacity = temPonteiro ? '0' : '0.8';
    quadro = requestAnimationFrame(laco);

    if (temPonteiro) {
      area.addEventListener('pointermove', aoMover);
      area.addEventListener('pointerleave', aoSair);
    }
    window.addEventListener('resize', aoRedimensionar);

    return () => {
      vivo = false;
      cancelAnimationFrame(quadro);
      area.removeEventListener('pointermove', aoMover);
      area.removeEventListener('pointerleave', aoSair);
      window.removeEventListener('resize', aoRedimensionar);
    };
  }, []);

  return (
    <div
      ref={brilho}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-0 size-[34rem] rounded-full opacity-0 mix-blend-screen transition-opacity duration-700 will-change-transform"
      style={{
        background:
          'radial-gradient(circle, rgb(63 135 245 / 0.55) 0%, rgb(96 160 250 / 0.22) 34%,' +
          ' rgb(63 135 245 / 0) 66%)',
        filter: 'blur(18px)',
      }}
    />
  );
}
