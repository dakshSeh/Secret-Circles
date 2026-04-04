import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SECRET CIRCLES — PRIVATE · INVITE ONLY",
  description: "Small groups compete in a public arena feed. Access is scarce. Identity has weight. Status is visible.",
};

import { Navbar } from "@/components/ui/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body className="bg-[#0F0F10] text-[#F0EDE8]">
        <div className="scan-line" />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
