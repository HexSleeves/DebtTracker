import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { env } from "~/env";
import { ErrorBoundary } from "../components/error-boundary";
import { PerformanceMonitor } from "../components/performance-monitor";
import { ThemeProvider } from "../components/theme-provider";
import { SiteConfig } from "../config/site";
import { TRPCReactProvider } from "../trpc/react";

export const metadata: Metadata = {
  title: {
    default: SiteConfig.title,
    template: `%s | ${SiteConfig.title}`,
  },
  description: SiteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="overflow-x-hidden">
        <ErrorBoundary
          resetOnPropsChange={true}
          // onError={(error, errorInfo) => {
          // 	// Log errors to console in development
          // 	if (process.env.NODE_ENV === "development") {
          // 		console.error("Root Error Boundary:", error, errorInfo);
          // 	}
          // 	// In production, you might want to send errors to a service like Sentry
          // 	// Example: Sentry.captureException(error, { extra: { errorInfo } });
          // }}
        >
          <ThemeProvider>
            <ClerkProvider
              publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            >
              <ErrorBoundary
                resetOnPropsChange={true}
                // onError={(error, errorInfo) => {
                // 	console.error("tRPC Error Boundary:", error, errorInfo);
                // }}
              >
                <TRPCReactProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                  <PerformanceMonitor />
                </TRPCReactProvider>
              </ErrorBoundary>
            </ClerkProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
