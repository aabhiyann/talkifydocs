import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import ClientThemeProvider from "@/components/ClientThemeProvider";

import "react-loading-skeleton/dist/skeleton.css";

import "simplebar-react/dist/simplebar.min.css";

import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TalkifyDocs - AI-Powered Document Analysis",
  description: "Upload, analyze, and chat with your PDF documents using advanced AI technology. Extract insights and get instant answers from your documents.",
  keywords: "PDF analysis, AI chat, document processing, PDF reader, document AI",
  authors: [{ name: "TalkifyDocs Team" }],
  metadataBase: new URL("https://talkifydocs.com"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "TalkifyDocs - AI-Powered Document Analysis",
    description: "Upload, analyze, and chat with your PDF documents using advanced AI technology.",
    type: "website",
    locale: "en_US",
    url: "https://talkifydocs.com",
    siteName: "TalkifyDocs",
    images: [{ url: "/thumbnail.png", width: 1200, height: 630, alt: "TalkifyDocs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TalkifyDocs - AI-Powered Document Analysis",
    description: "Upload, analyze, and chat with your PDF documents using advanced AI technology.",
    images: ["/thumbnail.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#22c55e" },
    { media: "(prefers-color-scheme: dark)", color: "#16a34a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#22c55e",
        },
      }}
    >
      <html lang="en">
        <head>
          <GoogleAnalytics />
        </head>
        <Providers>
          <body
            className={cn(
              "min-h-screen font-sans antialiased grainy",
              inter.className
            )}
            suppressHydrationWarning={true}
          >
            <ClientThemeProvider />
            <Toaster />
            <ErrorBoundary>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ErrorBoundary>
          </body>
        </Providers>
      </html>
    </ClerkProvider>
  );
}
