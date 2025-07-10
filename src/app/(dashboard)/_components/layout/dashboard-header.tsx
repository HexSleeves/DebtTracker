"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";

interface DashboardHeaderProps {
	setSidebarOpen: (open: boolean) => void;
}

export function DashboardHeader({ setSidebarOpen }: DashboardHeaderProps) {
	const { theme, setTheme } = useTheme();

	return (
		<header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
			<button
				type="button"
				className="-m-2.5 p-2.5 text-foreground lg:hidden"
				onClick={() => setSidebarOpen(true)}
				aria-label="Open sidebar"
			>
				<span className="sr-only">Open sidebar</span>
				<Menu className="h-6 w-6" aria-hidden="true" />
			</button>

			{/* Separator */}
			<div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

			<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
				<div className="flex flex-1" />
				<div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
					{/* Theme toggle */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setTheme(theme === "light" ? "dark" : "light")}
						aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
						className="relative"
					>
						<Sun className="dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0" />
						<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>

					{/* Separator */}
					<div
						className="hidden lg:block lg:h-6 lg:w-px lg:bg-border"
						aria-hidden="true"
					/>

					{/* Profile */}
					<UserButton
						afterSignOutUrl="/"
						appearance={{
							elements: {
								avatarBox: "w-8 h-8",
							},
						}}
					/>
				</div>
			</div>
		</header>
	);
}
