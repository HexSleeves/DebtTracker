"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Enhanced ThemeProvider with better system preference detection and hydration handling
 * Supports automatic theme switching based on system preferences
 * Now includes enhanced color system with semantic colors for debt tracking
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure hydration compatibility
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add enhanced color system support
  useEffect(() => {
    if (mounted) {
      // Add transition class for smooth theme changes
      document.documentElement.classList.add("transition-colors");

      // Add custom CSS properties for enhanced theming
      const style = document.createElement("style");
      style.textContent = `
				:root {
					transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
				}

				/* Enhanced focus states */
				*:focus-visible {
					outline: 2px solid var(--ring);
					outline-offset: 2px;
				}

				/* Smooth scrolling */
				html {
					scroll-behavior: smooth;
				}
			`;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [mounted]);

  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <NextThemesProvider
      enableSystem
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange={false}
      storageKey="debt-tracker-theme"
      themes={["light", "dark", "system"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
