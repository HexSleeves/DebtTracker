import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "~/env";
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
				<ThemeProvider>
					<ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
						<TRPCReactProvider>
							{children}
							<PerformanceMonitor />
						</TRPCReactProvider>
					</ClerkProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
