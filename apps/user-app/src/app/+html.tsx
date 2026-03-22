import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="Ultima Forma - Your portable, privacy-first identity app" />
        <meta name="theme-color" content="#f8fafc" />
        <title>Ultima Forma - Privacy-First Identity</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
      </head>
      <body style={{ margin: 0, backgroundColor: '#f8fafc' }}>{children}</body>
    </html>
  );
}
