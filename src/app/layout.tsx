import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "../trpc/react";

export const metadata: Metadata = {
	icons: [{ rel: "icon", url: "/favicon.ico" }],
	title: "Debt Manager - Take Control of Your Finances",
	description: "Comprehensive debt management and repayment optimization tool",
	viewport:
		"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
				/>
				<meta name="theme-color" content="#3B82F6" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
			</head>
			<body>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
