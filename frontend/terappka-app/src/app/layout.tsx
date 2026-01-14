import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

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
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
