import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Flex, Box, Separator, Heading, ScrollArea, IconButton } from '@radix-ui/themes';
import { cn } from '../utils';

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

export interface SidebarLink {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

export interface SidebarProps {
  title: string;
  links: SidebarLink[];
  onNavigate: (href: string) => void;
  footer?: ReactNode;
  inDrawer?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, show the title in the sidebar. Set false in drawer mode to avoid duplicate with header. */
  showTitle?: boolean;
}

function SidebarContent({
  title,
  links,
  onNavigate,
  footer,
  showTitle = true,
}: Pick<SidebarProps, 'title' | 'links' | 'onNavigate' | 'footer' | 'showTitle'>) {
  return (
    <Flex direction="column" height="100%">
      {showTitle && (
        <>
          <Box px="5" py="5" className="min-h-14 shrink-0">
            <Heading size="3" weight="medium">
              {title}
            </Heading>
          </Box>
          <Separator size="4" />
        </>
      )}
      <ScrollArea scrollbars="vertical" className="flex-1">
        <Box px="3" py="4">
          <Flex direction="column" gap="2" asChild>
            <nav>
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => onNavigate(link.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-r-lg rounded-l-sm px-4 py-3.5 text-left text-sm font-medium transition-colors',
                    link.active
                      ? 'bg-[var(--accent-a5)] text-[var(--accent-12)] border-l-4 border-l-[var(--accent-9)] ring-1 ring-[var(--accent-6)]/30'
                      : 'border-l-0 text-[var(--gray-11)] hover:bg-[var(--gray-a2)] hover:text-[var(--gray-12)]'
                  )}
                >
                  {link.icon && <span className="h-4 w-4 shrink-0">{link.icon}</span>}
                  {link.label}
                </button>
              ))}
            </nav>
          </Flex>
        </Box>
      </ScrollArea>
      {footer && (
        <>
          <Separator size="4" />
          <Box p="3" className="shrink-0">
            {footer}
          </Box>
        </>
      )}
    </Flex>
  );
}

export function Sidebar({
  title,
  links,
  onNavigate,
  footer,
  inDrawer = false,
  open = false,
  onOpenChange,
}: SidebarProps) {
  if (inDrawer) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-x-0 bottom-0 top-14 z-[9998] bg-black/60 transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
            style={{ pointerEvents: 'auto' }}
            onClick={() => onOpenChange?.(false)}
          />
          <Dialog.Content
            forceMount
            className="fixed inset-y-0 left-0 z-[9999] flex h-full w-64 flex-col border-r border-[var(--gray-6)] bg-[var(--gray-2)] text-[var(--gray-11)] shadow-xl transition-transform duration-200 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0"
            onEscapeKeyDown={() => onOpenChange?.(false)}
            onPointerDownOutside={() => onOpenChange?.(false)}
          >
            {/* Mobile drawer header with close button - title is in Topbar to avoid duplicate */}
            <Flex align="center" justify="end" px="4" py="4" className="shrink-0 border-b border-[var(--gray-6)]">
              <IconButton
                size="2"
                variant="ghost"
                color="gray"
                onClick={() => onOpenChange?.(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </IconButton>
            </Flex>
            <SidebarContent
              title={title}
              links={links}
              onNavigate={onNavigate}
              footer={footer}
              showTitle={false}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Box
      asChild
      className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--gray-6)] bg-[var(--gray-2)] text-[var(--gray-11)]"
    >
      <aside>
        <SidebarContent
          title={title}
          links={links}
          onNavigate={onNavigate}
          footer={footer}
        />
      </aside>
    </Box>
  );
}
