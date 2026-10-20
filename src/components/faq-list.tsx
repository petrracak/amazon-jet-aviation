import { useTranslations } from 'next-intl';

/*
  <details>/<summary> nativo: abre e fecha sem JavaScript, já vem com o
  comportamento de teclado e leitor de tela correto.
*/
export function FaqList({ limit }: { limit?: number }) {
  const t = useTranslations('faq');
  const items = t.raw('items') as { q: string; a: string }[];
  const shown = limit ? items.slice(0, limit) : items;

  return (
    <div className="divide-y divide-mist-deep border-y border-mist-deep">
      {shown.map((item) => (
        <details key={item.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-start gap-4 py-4 font-display text-lg leading-snug marker:hidden">
            <span className="flex-1">{item.q}</span>
            <span
              aria-hidden="true"
              className="mt-1.5 shrink-0 text-tag transition-transform group-open:rotate-45"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path
                  d="M8 1v14M1 8h14"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </summary>
          <p className="measure pb-5 leading-relaxed text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
