import type { ReactNode } from 'react';

type Tone = 'surface' | 'mist' | 'ink';

const tones: Record<Tone, string> = {
  surface: 'bg-surface text-ink',
  mist: 'bg-mist text-ink',
  ink: 'bg-ink text-surface',
};

export function Section({
  id,
  tone = 'surface',
  className = '',
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12] ${className}`}
    >
      {children}
    </h2>
  );
}
