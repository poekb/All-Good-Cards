import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookiesProvider } from "next-client-cookies/server";
import { LoadingProvider } from "@/components/cards/Button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "All good cards",
  description: "Very good cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CookiesProvider>
      <LoadingProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </LoadingProvider>
    </CookiesProvider>
  );
}
