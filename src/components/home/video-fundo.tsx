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
 * Cada formato de tela recebe o seu arquivo: 1,3 MB em 720p no computador,
 * 610 KB em 540p no celular, onde a faixa é pequena e a rede costuma ser
 * móvel. E no celular ele espera o primeiro sinal de interesse.
 *
 * Em dois casos ele não chega:
 *
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
  srcMobile,
}: {
  poster: string;
  posterMobile: string;
  src: string;
  srcMobile: string;
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

    const carregar = (fonte: string) => {
      el.addEventListener('canplay', aoPoder, { once: true });
      el.src = fonte;
      el.load();
    };

    const desligar = () => {
      el.pause();
      el.removeAttribute('src');
      el.load();
      setTocando(false);
    };

    /**
     * No celular o vídeo espera o visitante dar sinal de vida.
     *
     * São 610 KB numa rede que costuma ser móvel. Baixá-los junto com a
     * página atrasa o que a pessoa veio ler — medido, custava onze pontos
     * de PageSpeed e um segundo inteiro de LCP.
     *
     * Então o gatilho é o primeiro toque, a primeira rolagem ou a primeira
     * tecla. Quem está lendo a primeira tela parado já vê o pôster, que é
     * o mesmo quadro; quem se mexe demonstrou interesse, e aí vale gastar
     * os megabytes. Há ainda um prazo de seis segundos para quem fica
     * olhando sem tocar em nada.
     */
    const aoPrimeiroSinal = (acao: () => void) => {
      let feito = false;
      const sinais = ['pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'] as const;

      const disparar = () => {
        if (feito) return;
        feito = true;
        for (const s of sinais) window.removeEventListener(s, disparar);
        window.clearTimeout(prazo);
        acao();
      };

      const prazo = window.setTimeout(disparar, 6000);
      for (const s of sinais) {
        window.addEventListener(s, disparar, { once: true, passive: true });
      }

      return () => {
        for (const s of sinais) window.removeEventListener(s, disparar);
        window.clearTimeout(prazo);
      };
    };

    let fonteAtual = '';
    let cancelarEspera: (() => void) | undefined;

    const decidir = () => {
      const conexao = (navigator as { connection?: { saveData?: boolean } }).connection;

      // Quem pediu menos movimento no sistema não quer um avião em loop; e
      // saveData ligado é o visitante dizendo que está contando megabytes.
      if (parado.matches || conexao?.saveData === true) {
        if (fonteAtual) {
          fonteAtual = '';
          desligar();
        }
        return;
      }

      const noCelular = pequena.matches;
      const desejada = noCelular ? srcMobile : src;
      if (desejada === fonteAtual) return;

      fonteAtual = desejada;

      if (!noCelular) {
        carregar(desejada);
        return;
      }

      cancelarEspera?.();
      cancelarEspera = aoPrimeiroSinal(() => {
        if (fonteAtual === desejada) carregar(desejada);
      });
    };

    // A decisão é reavaliada quando a condição muda, não só na montagem:
    // quem abre a janela estreita e depois maximiza, ou gira o tablet,
    // passa a merecer o arquivo maior e precisa recebê-lo.
    decidir();
    pequena.addEventListener('change', decidir);
    parado.addEventListener('change', decidir);

    return () => {
      cancelarEspera?.();
      pequena.removeEventListener('change', decidir);
      parado.removeEventListener('change', decidir);
      el.removeEventListener('canplay', aoPoder);
    };
  }, [src, srcMobile]);

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
