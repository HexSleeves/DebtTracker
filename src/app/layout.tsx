import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCReactProvider } from "../trpc/react";

export const viewport: Viewport = {
	themeColor: "#3B82F6",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
	interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
	icons: [{ rel: "icon", url: "/favicon.ico" }],
	title: "Debt Manager - Take Control of Your Finances",
	description: "Comprehensive debt management and repayment optimization tool",
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
		<ClerkProvider>
			<html
				lang="en"
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<body>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
