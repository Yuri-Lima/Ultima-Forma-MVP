import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
        secondary:
          'border-transparent bg-muted text-muted-foreground',
        success:
          'border-transparent bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-300',
        danger:
          'border-transparent bg-danger-100 text-danger-800 dark:bg-danger-900/50 dark:text-danger-300',
        warning:
          'border-transparent bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-300',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
