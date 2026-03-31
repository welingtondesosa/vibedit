import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibedit Demo',
  description: 'Live visual editor for React — click any element to edit its styles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Script
              id="vibedit-port"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{ __html: 'window.__VIBEDIT_PORT__ = 4242;' }}
            />
            <Script src="/_vibedit/overlay.js" strategy="afterInteractive" />
          </>
        )}
      </body>
    </html>
  );
}
