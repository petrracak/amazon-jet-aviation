'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * O vídeo de fundo da primeira dobra.
 *
 * O pôster é quem manda: ele entra como imagem comum, pesa 11 KB e já
 * desenha a dobra inteira. O vídeo chega por cima depois, e só quando
 * chega é que aparece — nunca há retângulo preto esperando.
 *
 * E ele nem sempre chega, de propósito:
 *
 * - No celular não baixa. São 1,3 MB em rede móvel para um fundo que fica
 *   atrás de um véu escuro, e autoplay em celular falha com frequência.
 *   O pôster entrega a mesma dobra sem o custo.
 * - Com `prefers-reduced-motion` não baixa. Quem pediu menos movimento no
 *   sistema não quer um avião atravessando a tela em loop.
 * - Com `saveData` ligado no navegador não baixa. É o visitante dizendo
 *   explicitamente que está contando megabytes.
 *
 * O parallax move o fundo mais devagar que a página na rolagem. É sutil de
 * propósito: o suficiente para dar profundidade, pouco o bastante para
 * ninguém reparar no truque.
 */
export function VideoFundo({
  poster,
  posterMobile,
  src,
}: {
  poster: string;
  posterMobile: string;
  src: string;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const pequena = window.matchMedia('(max-width: 767px)');
    const parado = window.matchMedia('(prefers-reduced-motion: reduce)');

    const aoPoder = () => {
      el.play()
        .then(() => setTocando(true))
        .catch(() => {
          // Autoplay recusado: o pôster continua de pé e ninguém percebe.
        });
    };

    // A decisão é reavaliada quando a condição muda, não só na montagem:
    // quem abre a janela estreita e depois maximiza, ou gira o tablet,
    // passa a merecer o vídeo e precisa recebê-lo.
    const decidir = () => {
      const conexao = (navigator as { connection?: { saveData?: boolean } }).connection;
      const pode = !pequena.matches && !parado.matches && conexao?.saveData !== true;

      if (pode && !el.src) {
        el.addEventListener('canplay', aoPoder, { once: true });
        el.src = src;
        el.load();
        return;
      }

      // Deixou de valer a pena: para o vídeo e devolve a dobra ao pôster.
      if (!pode && el.src) {
        el.pause();
        el.removeAttribute('src');
        el.load();
        setTocando(false);
      }
    };

    decidir();
    pequena.addEventListener('change', decidir);
    parado.addEventListener('change', decidir);

    return () => {
      pequena.removeEventListener('change', decidir);
      parado.removeEventListener('change', decidir);
      el.removeEventListener('canplay', aoPoder);
    };
  }, [src]);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // No celular a mídia é uma faixa no fluxo, não fundo de tela cheia:
    // deslocar o conteúdo dela ali só deixaria a borda à mostra.
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    let quadro = 0;
    let naTela = true;

    const mover = () => {
      quadro = 0;
      const topo = el.getBoundingClientRect().top;
      // Um quarto da velocidade da página, limitado à sobra de altura da
      // caixa — passar disso descolaria o fundo e deixaria borda à vista.
      const deslocamento = Math.max(-90, Math.min(0, topo * -0.25));
      el.style.transform = `translate3d(0, ${deslocamento}px, 0)`;
    };

    const aoRolar = () => {
      if (quadro || !naTela) return;
      quadro = requestAnimationFrame(mover);
    };

    const olho = new IntersectionObserver(([e]) => {
      naTela = e.isIntersecting;
    });
    olho.observe(el);

    window.addEventListener('scroll', aoRolar, { passive: true });
    mover();

    return () => {
      window.removeEventListener('scroll', aoRolar);
      olho.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <div ref={caixa} aria-hidden className="absolute inset-0 -z-10 overflow-hidden lg:-top-[7%] lg:h-[114%] lg:will-change-transform">
      {/*
        Dois pôsteres, um por formato de tela. O quadro do vídeo é 16:9, e
        num celular em pé `object-cover` ampliaria tanto que o avião perderia
        as asas fora da tela. A versão de celular é o mesmo quadro na largura
        inteira, sobre um fundo feito dele próprio, ampliado e desfocado:
        preenche o retrato sem esticar nem cortar.
      */}
      <picture>
        <source media="(max-width: 767px)" srcSet={posterMobile} />
        <img
          src={poster}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        className={cn(
          'absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-out',
          tocando ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}
