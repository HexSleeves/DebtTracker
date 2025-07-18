import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				// Enhanced caching configuration
				staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
				gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data for 10 minutes
				retry: (failureCount, error) => {
					// Don't retry on 4xx errors, but retry on 5xx and network errors
					if (error && typeof error === "object" && "status" in error) {
						const status = error.status as number;
						if (status >= 400 && status < 500) return false;
					}
					return failureCount < 3;
				},
				retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
				// Refetch on window focus for critical data
				refetchOnWindowFocus: (query) => {
					// Only refetch debt-related queries on window focus
					return query.queryKey.some(
						(key) =>
							typeof key === "string" &&
							["debt", "payment", "paymentPlan"].includes(key),
					);
				},
				refetchOnReconnect: true,
			},
			mutations: {
				retry: (failureCount, error) => {
					// Don't retry mutations on 4xx errors
					if (error && typeof error === "object" && "status" in error) {
						const status = error.status as number;
						if (status >= 400 && status < 500) return false;
					}
					return failureCount < 2;
				},
				retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	});
