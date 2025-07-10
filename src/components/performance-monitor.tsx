"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

interface PerformanceMetrics {
	renderTime: number;
	ttrpcRequestTime: number;
	cacheHitRate: number;
	totalQueries: number;
	staleQueries: number;
	loadingQueries: number;
	errorQueries: number;
}

interface QueryState {
	status: "idle" | "pending" | "success" | "error";
}

interface QueryInfo {
	isStale: () => boolean;
	state: QueryState;
}

export function PerformanceMonitor() {
	const [metrics, setMetrics] = useState<PerformanceMetrics>({
		renderTime: 0,
		ttrpcRequestTime: 0,
		cacheHitRate: 0,
		totalQueries: 0,
		staleQueries: 0,
		loadingQueries: 0,
		errorQueries: 0,
	});
	const [isVisible, setIsVisible] = useState(false);
	const queryClient = useQueryClient();

	const measurePerformance = useCallback(() => {
		// Measure DOM loading time - use fetchStart as fallback for navigationStart
		const navEntry = performance.getEntriesByType(
			"navigation",
		)[0] as PerformanceNavigationTiming;
		const domTime = navEntry
			? navEntry.domInteractive - (navEntry.fetchStart || 0)
			: 0;

		// Measure tRPC request timing from resource entries
		const resourceEntries = performance.getEntriesByType("resource");
		const ttrpcRequests = resourceEntries.filter((entry) =>
			entry.name.includes("/api/trpc"),
		);
		const avgTRPCTime =
			ttrpcRequests.length > 0
				? ttrpcRequests.reduce((sum, entry) => sum + entry.duration, 0) /
					ttrpcRequests.length
				: 0;

		// Get React Query metrics
		const queryCache = queryClient.getQueryCache();
		const queries = queryCache.getAll() as QueryInfo[];
		const totalQueries = queries.length;
		const staleQueries = queries.filter((q: QueryInfo) => q.isStale()).length;
		const loadingQueries = queries.filter(
			(q: QueryInfo) => q.state.status === "pending",
		).length;
		const errorQueries = queries.filter(
			(q: QueryInfo) => q.state.status === "error",
		).length;

		const cacheHitRate =
			totalQueries > 0
				? ((totalQueries - loadingQueries) / totalQueries) * 100
				: 0;

		setMetrics({
			renderTime: domTime,
			ttrpcRequestTime: avgTRPCTime,
			cacheHitRate,
			totalQueries,
			staleQueries,
			loadingQueries,
			errorQueries,
		});
	}, [queryClient]);

	useEffect(() => {
		measurePerformance();

		// Update metrics every 5 seconds
		const interval = setInterval(measurePerformance, 5000);

		return () => clearInterval(interval);
	}, [measurePerformance]);

	// Only show in development
	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<div className="fixed right-4 bottom-4 z-50">
			<button
				type="button"
				onClick={() => setIsVisible(!isVisible)}
				className="rounded-md bg-blue-600 px-3 py-1 font-medium text-sm text-white shadow-lg transition-colors hover:bg-blue-700"
			>
				📊 Performance
			</button>

			{isVisible && (
				<div className="mt-2 max-w-sm rounded-lg bg-gray-900 p-4 text-sm text-white shadow-xl">
					<h3 className="mb-2 font-semibold">Performance Metrics</h3>
					<div className="space-y-1">
						<div className="flex justify-between">
							<span>DOM Load:</span>
							<span
								className={
									metrics.renderTime > 3000 ? "text-red-400" : "text-green-400"
								}
							>
								{metrics.renderTime.toFixed(0)}ms
							</span>
						</div>
						<div className="flex justify-between">
							<span>Avg tRPC:</span>
							<span
								className={
									metrics.ttrpcRequestTime > 1000
										? "text-red-400"
										: "text-green-400"
								}
							>
								{metrics.ttrpcRequestTime.toFixed(0)}ms
							</span>
						</div>
						<div className="flex justify-between">
							<span>Cache Hit Rate:</span>
							<span
								className={
									metrics.cacheHitRate < 80 ? "text-red-400" : "text-green-400"
								}
							>
								{metrics.cacheHitRate.toFixed(1)}%
							</span>
						</div>
						<div className="flex justify-between">
							<span>Total Queries:</span>
							<span>{metrics.totalQueries}</span>
						</div>
						<div className="flex justify-between">
							<span>Stale:</span>
							<span
								className={
									metrics.staleQueries > 5 ? "text-yellow-400" : "text-gray-400"
								}
							>
								{metrics.staleQueries}
							</span>
						</div>
						<div className="flex justify-between">
							<span>Loading:</span>
							<span
								className={
									metrics.loadingQueries > 0 ? "text-blue-400" : "text-gray-400"
								}
							>
								{metrics.loadingQueries}
							</span>
						</div>
						<div className="flex justify-between">
							<span>Errors:</span>
							<span
								className={
									metrics.errorQueries > 0 ? "text-red-400" : "text-gray-400"
								}
							>
								{metrics.errorQueries}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Hook for measuring component render times
export function useRenderTime(componentName: string) {
	useEffect(() => {
		const start = performance.now();

		return () => {
			const end = performance.now();
			console.log(
				`[Render Time] ${componentName}: ${(end - start).toFixed(2)}ms`,
			);
		};
	}, [componentName]);
}

// Hook for measuring hook execution times
export function useMeasureHook(
	hookName: string,
	dependencies: readonly unknown[],
) {
	useEffect(() => {
		const start = performance.now();
		performance.mark(`${hookName}-start`);

		return () => {
			const end = performance.now();
			performance.mark(`${hookName}-end`);
			performance.measure(hookName, `${hookName}-start`, `${hookName}-end`);
			console.log(
				`[Hook Performance] ${hookName}: ${(end - start).toFixed(2)}ms`,
			);
		};
	}, [hookName, ...dependencies]);
}
