// pages/_app.tsx
import { AppProps } from "next/app";
import { useEffect } from "react";
import { refreshToken } from "../../auth";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshToken(); // Refresh every 5 minutes
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
