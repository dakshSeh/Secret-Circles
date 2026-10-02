import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Theorem — Where Learning is Forged Through Practice",
  description:
    "Upload your CBSE notes and let AI forge personalized exam-style assessments in seconds. Turn any chapter into exam-ready practice.",
  keywords: ["CBSE", "exam preparation", "AI quiz", "question generator", "study material"],
  authors: [{ name: "Theorem" }],
  openGraph: {
    title: "Theorem — Forge Better Questions",
    description: "AI-powered CBSE assessment platform. Upload notes, get exam-ready questions instantly.",
    type: "website",
  },
  verification: {
    google: "G5j582XOUR51v3SbzcpgQj-wTgt31WFe7YVXmgbo3Tg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8R0K6H6KDL"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8R0K6H6KDL');
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
