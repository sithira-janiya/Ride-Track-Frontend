import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { BootScreenHtml, bootScreenCss } from '@/components/loading/BootScreenHtml';

// Web only: the HTML page every route is rendered into. Besides Expo's defaults it carries the boot screen, which
// covers the otherwise blank page while the JavaScript downloads (handy on slow mobile data after scanning the QR).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bootScreenCss }} />
      </head>
      <body>
        {children}
        <BootScreenHtml />
        <noscript>RideTrack needs JavaScript to run. Please turn it on and reload the page.</noscript>
      </body>
    </html>
  );
}
