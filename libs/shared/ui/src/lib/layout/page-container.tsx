import type { ReactNode } from 'react';
import { Container, Section, Flex, Box } from '@radix-ui/themes';
import { cn } from '../utils';

export interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
}: PageContainerProps) {
  return (
    <Container
      size="4"
      px={{ initial: '4', md: '6', lg: '8' }}
      py={{ initial: '4', md: '6' }}
      className={cn('flex-1', className)}
    >
      <Section size={{ initial: '1', md: '2' }}>
        <Flex direction="column" gap="6">
          {(title || actions) && (
            <Flex justify="between" align="start" wrap="wrap" gap="4">
              <Box>
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </Box>
              {actions && (
                <Flex gap="2" align="center">
                  {actions}
                </Flex>
              )}
            </Flex>
          )}
          {children}
        </Flex>
      </Section>
    </Container>
  );
}
