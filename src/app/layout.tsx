import { Inter, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import ClientThemeProvider from "@/components/ClientThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { cn } from "@/lib/utils";

import "./globals.css";
import "simplebar-react/dist/simplebar.min.css";

import type { Metadata, Viewport } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TalkifyDocs - AI-Powered Document Analysis",
  description:
    "Upload, analyze, and chat with your PDF documents using advanced AI technology. Extract insights and get instant answers from your documents.",
  keywords: "PDF analysis, AI chat, document processing, PDF reader, document AI",
  authors: [{ name: "TalkifyDocs Team" }],
  metadataBase: new URL("https://talkifydocs.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: "/brand/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "TalkifyDocs - AI-Powered Document Analysis",
    description: "Upload, analyze, and chat with your PDF documents using advanced AI technology.",
    type: "website",
    locale: "en_US",
    url: "https://talkifydocs.com",
    siteName: "TalkifyDocs",
    images: [{ url: "/brand/social/og-image.png", width: 1200, height: 630, alt: "TalkifyDocs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TalkifyDocs - AI-Powered Document Analysis",
    description: "Upload, analyze, and chat with your PDF documents using advanced AI technology.",
    images: ["/brand/social/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#2563eb" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#2563eb",
        },
      }}
    >
      <html lang="en" className={cn(inter.variable, fraunces.variable)}>
        <head>
          <GoogleAnalytics />
        </head>
        <Providers>
          <body
            className={cn(
              "grainy min-h-screen font-sans antialiased",
              inter.className,
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
