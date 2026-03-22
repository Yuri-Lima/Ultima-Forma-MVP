import React from 'react';
import { Spinner } from '../components/spinner';
import { cn } from '../utils';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[14rem] flex-col items-center justify-center gap-5 py-20',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card/50 px-10 py-8 shadow-sm">
        <Spinner
          size="xl"
          className="text-primary-500 dark:text-primary-400"
        />
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
}
