import type { ReactNode } from 'react';
import { Section as RadixSection } from '@radix-ui/themes';
import { cn } from '../utils';

export interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <RadixSection className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </RadixSection>
  );
}
