import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AdminAuthProvider>
      <Component {...pageProps} />
      <Toaster />
    </AdminAuthProvider>
  );
}