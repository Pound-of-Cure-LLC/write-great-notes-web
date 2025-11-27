"use client";

import React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";
import { swrConfig } from "@/lib/swr-config";
import { EMRConfigErrorModal } from "@/components/EMRConfigErrorModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title key="title">Write Great Notes</title>
        <meta key="description" name="description" content="Clinical note generation for healthcare providers" />
        <link key="icon" rel="icon" href="/icon.png" />
        <link key="apple-icon" rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>
        <SWRConfig value={swrConfig}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <React.Fragment key="app-content">
              {children}
            </React.Fragment>
            <Toaster key="toaster" richColors position="top-right" />
            <EMRConfigErrorModal key="emr-error-modal" />
          </ThemeProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
