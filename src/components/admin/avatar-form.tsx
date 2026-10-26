'use client';

import { Camera, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';

import { salvarAvatar } from '@/app/actions/avatar';
import { Avatar } from '@/components/admin/avatar';
import { Cartao, botao } from '@/components/admin/ui';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function AvatarForm({
  perfilId,
  nome,
  avatarUrl,
}: {
  perfilId: string;
  nome: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(avatarUrl);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  async function enviar(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);
    setEnviando(true);

    const supabase = createClient();
    const ext = arquivo.name.split('.').pop() ?? 'jpg';
    const caminho = `${perfilId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(caminho, arquivo, { contentType: arquivo.type, upsert: true });

    if (error) {
      setErro(error.message);
      setEnviando(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(caminho);
    setUrl(data.publicUrl);
    setEnviando(false);
    if (input.current) input.current.value = '';

    startTransition(async () => {
      await salvarAvatar(data.publicUrl);
      router.refresh();
    });
  }

  function remover() {
    setUrl(null);
    startTransition(async () => {
      await salvarAvatar(null);
      router.refresh();
    });
  }

  return (
    <Cartao titulo="Sua foto" descricao="Aparece no canto do painel. Opcional.">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar url={url} nome={nome} tamanho="lg" />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={enviando}
            className={cn(botao.secundario)}
          >
            <Camera className="size-5" strokeWidth={1.6} />
            {enviando ? 'Enviando…' : url ? 'Trocar foto' : 'Escolher foto'}
          </button>

          {url ? (
            <button type="button" onClick={remover} className={botao.perigo}>
              <Trash2 className="size-5" strokeWidth={1.6} />
              Remover
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => enviar(e.target.files?.[0])}
      />

      {erro ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {erro}
        </p>
      ) : null}
    </Cartao>
  );
}
