import type { ReactNode } from 'react';
import { Flex, Box, IconButton, Heading } from '@radix-ui/themes';
import { cn } from '../utils';
import { useIsMobile } from '../hooks/use-media-query';

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export interface TopbarProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Topbar({
  children,
  className,
  title,
  onToggleSidebar,
  sidebarOpen = false,
}: TopbarProps) {
  const isMobile = useIsMobile();

  return (
    <Box asChild className={cn('shrink-0', className)}>
      <header className="border-b border-[var(--gray-7)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        <Flex
          align="center"
          justify="between"
          px={{ initial: '4', md: '6' }}
          py="3"
          className="min-h-14 w-full bg-[var(--color-panel-solid)]"
        >
          <Flex align="center" gap="2">
            {onToggleSidebar && isMobile && (
              <IconButton
                size="2"
                variant="ghost"
                color="gray"
                onClick={onToggleSidebar}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
              </IconButton>
            )}
            {title && (
              <Heading size="3" weight="medium" className="text-[var(--gray-12)]">
                {title}
              </Heading>
            )}
          </Flex>
          <Flex align="center" justify="end" gap="3">
            {children}
          </Flex>
        </Flex>
      </header>
    </Box>
  );
}
