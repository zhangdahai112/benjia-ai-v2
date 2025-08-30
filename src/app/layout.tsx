import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { AIServicesProvider } from "@/contexts/AIServicesContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";

// ... existing code ... <font imports and metadata>

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>
          <AIServicesProvider>
            <CollaborationProvider>
              <ClientBody>{children}</ClientBody>
            </CollaborationProvider>
          </AIServicesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
