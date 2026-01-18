import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TerAppka",
  description: "System komunikacji z terapeutą",
};

export default function RootLayout({ 
  children
 }: { 
  children: React.ReactNode
 }) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <Header />
          <main>
            {children}
          </main>
          
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
