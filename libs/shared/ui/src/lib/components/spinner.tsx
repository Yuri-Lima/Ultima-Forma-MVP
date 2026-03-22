import * as React from 'react';
import { cn } from '../utils';

export interface SpinnerProps extends React.SVGAttributes<SVGElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
} as const;

function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  const gradientId = React.useId().replace(/:/g, '-');
  return (
    <svg
      className={cn('animate-spin', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="24 40"
        strokeDashoffset="0"
        className="opacity-90"
      />
    </svg>
  );
}

export { Spinner };
