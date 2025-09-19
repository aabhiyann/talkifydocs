import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

import "react-loading-skeleton/dist/skeleton.css";

import "simplebar-react/dist/simplebar.min.css";

import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TalkifyDocs - AI-Powered Document Analysis",
  description: "Upload, analyze, and chat with your PDF documents using advanced AI technology. Extract insights and get instant answers from your documents.",
  keywords: "PDF analysis, AI chat, document processing, PDF reader, document AI",
  authors: [{ name: "TalkifyDocs Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#22c55e" },
    { media: "(prefers-color-scheme: dark)", color: "#16a34a" },
  ],
  openGraph: {
    title: "TalkifyDocs - AI-Powered Document Analysis",
    description: "Upload, analyze, and chat with your PDF documents using advanced AI technology.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalkifyDocs - AI-Powered Document Analysis",
    description: "Upload, analyze, and chat with your PDF documents using advanced AI technology.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('talkifydocs-ui-theme') || 'system';
                const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.add(isDark ? 'dark' : 'light');
              } catch (e) {
                document.documentElement.classList.add('light');
              }
            `,
          }}
        />
      </head>
      <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            inter.className
          )}
        >
          <Toaster />
              <ErrorBoundary>
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </ErrorBoundary>
        </body>
      </Providers>
    </html>
  );
}
