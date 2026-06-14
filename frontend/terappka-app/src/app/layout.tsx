import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "../components/session/SessionProviderWrapper";
import Header from "../components/utils/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TerAppka",
  description: "System komunikacji z terapeutą",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body
        className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}
      >
        <SessionProviderWrapper>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
