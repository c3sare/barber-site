import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Barlow, Courgette } from '@next/font/google';
import { SWRConfig } from 'swr';
import '@react-page/editor/lib/index.css';
import type { EmotionCache } from '@emotion/react';
import { CacheProvider } from '@emotion/react';
import '@react-page/plugins-background/lib/index.css';
import '@react-page/plugins-html5-video/lib/index.css';
import '@react-page/plugins-spacer/lib/index.css';
import '@react-page/plugins-video/lib/index.css';
import '@react-page/plugins-image/lib/index.css';
import '@react-page/plugins-slate/lib/index.css';
import 'katex/dist/katex.min.css';
import createCache from '@emotion/cache';

import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}

const barlow = Barlow({weight: "400", style: "normal", subsets: ["latin", "latin-ext"]});
const courgette = Courgette({weight: "400", style: "normal", subsets: ["latin", "latin-ext"]});

const clientSideEmotionCache = createEmotionCache();
const theme = createTheme();

export default function App({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppProps & { emotionCache: EmotionCache }) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource:any, init:any) => fetch(resource, init).then(res => res.json()),
        onError: (err:any) => {
          console.error(err)
        },
      }}
    >
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
        <style jsx global>{`
          html {
            font-family: ${barlow.style.fontFamily};
          }
          h1, h2, h3, h4, h5 {
            font-family: ${courgette.style.fontFamily};
          }
        `}</style>
        <CssBaseline />
        <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </SWRConfig>
  );
}
