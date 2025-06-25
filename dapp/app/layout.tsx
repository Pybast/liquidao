import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "LiquiDAO - Private, low-fee swapping environment for DAOs and foundations",
  description: "Private, low-fee swapping environment for DAOs and foundations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="chaingate">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-base-100">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
