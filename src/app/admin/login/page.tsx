'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { createClient } from '@/lib/supabase/client';

const MENSAGENS: Record<string, string> = {
  'link-invalido': 'Esse link não é válido. Entre com sua senha abaixo.',
  'link-expirado': 'O link expirou. Entre com sua senha abaixo.',
  'sem-acesso': 'Esse e-mail não tem acesso ao painel. Fale com o administrador.',
};

// Campos sobre vidro: contorno claro e um véu, para a área de toque
// continuar evidente sobre o fundo escuro.
const entrada =
  'mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-base text-white placeholder:text-white/40 transition-colors focus:border-white/40 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/25 lg:text-[0.9375rem]';

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get('redirect') ?? '/admin';

  const [modo, setModo] = useState<'senha' | 'link'>('senha');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(MENSAGENS[params.get('erro') ?? ''] ?? null);

  async function entrarComSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      setOcupado(false);
      setErro(
        /invalid login credentials/i.test(error.message)
          ? 'E-mail ou senha não conferem.'
          : 'Não deu para entrar agora. Tente de novo em instantes.',
      );
      return;
    }

    // refresh() faz o servidor reler a sessão recém-gravada no cookie.
    router.replace(destino);
    router.refresh();
  }

  async function pedirLink(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(destino)}`,
        shouldCreateUser: false,
      },
    });

    setOcupado(false);

    if (error) {
      setErro(
        /signups not allowed/i.test(error.message)
          ? 'Esse e-mail não tem acesso ao painel. Fale com o administrador.'
          : 'Não deu para enviar o link agora. Entre com sua senha.',
      );
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="text-white">
        <h1 className="font-display text-[1.75rem] leading-tight">Link enviado</h1>
        <p className="mt-4 text-pretty leading-relaxed text-white/70">
          Abra o e-mail que chegou em <span className="text-white">{email}</span> e toque no link.
          Ele vale por uma hora.
        </p>
        <button
          type="button"
          onClick={() => {
            setEnviado(false);
            setModo('senha');
          }}
          className="mt-8 text-sm text-white underline-offset-4 hover:underline"
        >
          Entrar com senha
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={modo === 'senha' ? entrarComSenha : pedirLink} className="text-white">
      <h1 className="font-display text-[1.75rem] leading-tight">Entrar no painel</h1>
      <p className="mt-3 text-pretty leading-relaxed text-white/70">
        {modo === 'senha'
          ? 'Use o seu e-mail e a sua senha.'
          : 'Informe o seu e-mail e enviamos um link de acesso.'}
      </p>

      <label htmlFor="email" className="mt-8 block text-sm text-white/70">
        E-mail
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="username"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nome@amazonjetaviation.com"
        className={entrada}
      />

      {modo === 'senha' ? (
        <>
          <label htmlFor="senha" className="mt-5 block text-sm text-white/70">
            Senha
          </label>
          <div className="relative">
            <input
              id="senha"
              type={verSenha ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className={`${entrada} pr-12`}
            />
            <button
              type="button"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? 'Esconder senha' : 'Mostrar senha'}
              className="absolute bottom-3.5 right-4 text-white/50 transition-colors hover:text-white"
            >
              {verSenha ? (
                <EyeOff className="size-5" strokeWidth={1.5} />
              ) : (
                <Eye className="size-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </>
      ) : null}

      {erro ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm"
        >
          {erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={ocupado}
        className="mt-7 w-full rounded-full bg-white px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-white/90 disabled:opacity-60"
      >
        {ocupado ? 'Aguarde…' : modo === 'senha' ? 'Entrar' : 'Enviar link de acesso'}
      </button>

      <button
        type="button"
        onClick={() => {
          setModo(modo === 'senha' ? 'link' : 'senha');
          setErro(null);
        }}
        className="mt-5 block w-full text-center text-sm text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
      >
        {modo === 'senha'
          ? 'Esqueci a senha, quero um link por e-mail'
          : 'Prefiro entrar com minha senha'}
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-ink px-5 py-12">
      {/* Fundo: o facho de luz do hangar, em duas manchas suaves. Nada que
          se mexa — a tela de entrada não é lugar de espetáculo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(60rem 40rem at 15% -10%, rgb(14 79 196 / 0.35), transparent 60%), radial-gradient(45rem 35rem at 100% 110%, rgb(227 160 8 / 0.18), transparent 60%)',
        }}
      />

      <div className="w-full max-w-[26rem]">
        <div className="flex justify-center">
          <BrandLogo tamanho="lg" />
        </div>

        <div className="mt-9 rounded-[1.75rem] border border-white/15 bg-white/[0.07] p-7 shadow-[0_30px_80px_-24px_rgb(0_0_0/0.65)] backdrop-blur-2xl sm:p-9">
          <Suspense fallback={null}>
            <Formulario />
          </Suspense>
        </div>

        <Link
          href="/"
          className="mt-8 block text-center text-sm text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
