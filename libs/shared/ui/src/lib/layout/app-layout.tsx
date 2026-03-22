import type { ReactNode } from 'react';
import { useState } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { Sidebar, type SidebarLink } from './sidebar';
import { Topbar } from './topbar';

export interface AppLayoutProps {
  sidebarTitle: string;
  sidebarLinks: SidebarLink[];
  onNavigate: (href: string) => void;
  sidebarFooter?: ReactNode;
  topbarContent?: ReactNode;
  children: ReactNode;
}

export function AppLayout({
  sidebarTitle,
  sidebarLinks,
  onNavigate,
  sidebarFooter,
  topbarContent,
  children,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (href: string) => {
    onNavigate(href);
    setSidebarOpen(false);
  };

  return (
    <Flex direction="row" height="100vh" className="bg-background text-foreground font-sans">
      {/* Desktop sidebar - no title to avoid duplicate with header */}
      <Box className="hidden shrink-0 lg:flex" style={{ width: 256 }} asChild>
        <div>
          <Sidebar
            title={sidebarTitle}
            links={sidebarLinks}
            onNavigate={onNavigate}
            footer={sidebarFooter}
            inDrawer={false}
            showTitle={false}
          />
        </div>
      </Box>

      {/* Mobile sidebar drawer */}
      <Sidebar
        title={sidebarTitle}
        links={sidebarLinks}
        onNavigate={handleNavigate}
        footer={sidebarFooter}
        inDrawer
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <Flex
        direction="column"
        flexGrow="1"
        minWidth="0"
        overflow="hidden"
        className="bg-background"
      >
        {topbarContent && (
          <Topbar
            title={sidebarTitle}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            sidebarOpen={sidebarOpen}
          >
            {topbarContent}
          </Topbar>
        )}
        <Box asChild flexGrow="1" overflowY="auto" className="bg-background">
          <main>{children}</main>
        </Box>
      </Flex>
    </Flex>
  );
}
