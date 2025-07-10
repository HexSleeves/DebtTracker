"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Enhanced ThemeProvider with better system preference detection and hydration handling
 * Supports automatic theme switching based on system preferences
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	const [mounted, setMounted] = useState(false);

	// Ensure hydration compatibility
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Return a placeholder during SSR to prevent hydration mismatch
		return <div style={{ visibility: "hidden" }}>{children}</div>;
	}

	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange={false}
			storageKey="debt-tracker-theme"
			themes={["light", "dark", "system"]}
			{...props}
		>
			{children}
		</NextThemesProvider>
	);
}
