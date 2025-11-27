"use client";

import { ReactNode } from "react";
import { TitleBar } from "@/components/TitleBar";
import { Footer } from "@/components/Footer";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout: Main layout wrapper for authenticated pages
 *
 * Features:
 * - Title bar with hamburger menu, logo, and global search
 * - Full-width main content area (use Tabs component within for page-level navigation)
 * - Footer at bottom
 *
 * Usage:
 * <AppLayout>
 *   <YourPageContent />
 * </AppLayout>
 *
 * For pages with multiple sections, use shadcn/ui Tabs component:
 * <AppLayout>
 *   <Tabs>
 *     <TabsList>...</TabsList>
 *     <TabsContent>...</TabsContent>
 *   </Tabs>
 * </AppLayout>
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content Area */}
      <div className="flex-1 container px-4 py-6 overflow-y-auto">
        <main className="w-full">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
