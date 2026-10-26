'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema claro e escuro"
      title="Alternar tema"
      className={cn(
        'grid size-10 place-items-center rounded-full border border-border-base text-fg-muted transition-colors hover:border-border-strong hover:text-fg',
        className,
      )}
    >
      <Moon className="size-[1.1rem] dark:hidden" strokeWidth={1.5} />
      <Sun className="hidden size-[1.1rem] dark:block" strokeWidth={1.5} />
    </button>
  );
}
