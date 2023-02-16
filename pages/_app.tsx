import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Barlow, Courgette } from '@next/font/google';
import { SWRConfig } from 'swr';

const barlow = Barlow({weight: "400", style: "normal", subsets: ["latin", "latin-ext"]});
const courgette = Courgette({weight: "400", style: "normal", subsets: ["latin", "latin-ext"]});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
        onError: (err) => {
          console.error(err)
        },
      }}
    >
      <style jsx global>{`
        html {
          font-family: ${barlow.style.fontFamily};
        }
        h1, h2, h3, h4, h5 {
          font-family: ${courgette.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </SWRConfig>
  );
}
