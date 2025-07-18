"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UseAuthGuardOptions {
	redirectTo?: string;
	enabled?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
	const { redirectTo = "/sign-in", enabled = true } = options;
	const { user, isLoaded, isSignedIn } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (!enabled) return;

		if (isLoaded && !isSignedIn) {
			router.push(redirectTo);
		}
	}, [isLoaded, isSignedIn, redirectTo, router, enabled]);

	return {
		isLoaded,
		isSignedIn,
		isAuthenticated: isLoaded && isSignedIn && !!user,
		// biome-ignore lint/style/noNonNullAssertion: user is not null when isLoaded and isSignedIn are true
		user: user!,
	};
}
