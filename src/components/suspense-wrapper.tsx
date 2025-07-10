"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Loading skeleton component for dashboard cards
export function DashboardCardSkeleton() {
	return (
		<Card className="animate-pulse">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">
					<div className="h-4 w-24 rounded bg-gray-200" />
				</CardTitle>
				<div className="h-4 w-4 rounded bg-gray-200" />
			</CardHeader>
			<CardContent>
				<div className="mb-2 h-8 w-32 rounded bg-gray-200" />
				<div className="h-4 w-40 rounded bg-gray-200" />
			</CardContent>
		</Card>
	);
}

// Loading skeleton for upcoming payments
export function UpcomingPaymentsSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div className="h-5 w-5 rounded bg-gray-200" />
					<div className="h-5 w-32 rounded bg-gray-200" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{["skel-1", "skel-2", "skel-3"].map((skel) => (
						<div
							key={skel}
							className="flex animate-pulse items-center justify-between rounded-lg bg-gray-50 p-3"
						>
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 rounded-full bg-gray-200" />
								<div>
									<div className="mb-1 h-4 w-24 rounded bg-gray-200" />
									<div className="h-3 w-16 rounded bg-gray-200" />
								</div>
							</div>
							<div className="text-right">
								<div className="mb-1 h-4 w-16 rounded bg-gray-200" />
								<div className="h-3 w-12 rounded bg-gray-200" />
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// Generic loading skeleton with motion
export function LoadingSkeleton({
	className = "space-y-4",
}: {
	className?: string;
}) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
		>
			<div className="animate-pulse space-y-4">
				<div className="h-8 w-48 rounded bg-gray-200" />
				<div className="h-4 w-64 rounded bg-gray-200" />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{["skel-1", "skel-2", "skel-3", "skel-4"].map((skel) => (
						<DashboardCardSkeleton key={skel} />
					))}
				</div>
			</div>
		</motion.div>
	);
}

// Enhanced Suspense wrapper with error boundary
interface SuspenseWrapperProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	errorFallback?: React.ReactNode;
}

export function SuspenseWrapper({
	children,
	fallback = <LoadingSkeleton />,
	// errorFallback = <div className="text-red-500">Something went wrong</div>,
}: SuspenseWrapperProps) {
	return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Specialized wrapper for dashboard sections
export function DashboardSuspenseWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SuspenseWrapper
			fallback={
				<motion.div
					className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					{["skel-1", "skel-2", "skel-3", "skel-4"].map((skel) => (
						<DashboardCardSkeleton key={skel} />
					))}
				</motion.div>
			}
		>
			{children}
		</SuspenseWrapper>
	);
}
