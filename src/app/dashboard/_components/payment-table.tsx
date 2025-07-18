"use client";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	CreditCard,
	Plus,
} from "lucide-react";
import { useMemo } from "react";
import { DashboardCardSkeleton } from "~/components/suspense-wrapper";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { formatCurrency } from "~/lib/currency";
import { cn } from "~/lib/utils";
import type { Payment } from "~/types/db.helpers";

type PaymentStatus = "completed" | "pending" | "failed";

const getStatusColor = (status: PaymentStatus) => {
	switch (status) {
		case "completed":
			return "bg-success-50 text-success-700 border-success-100 dark:bg-success-50/10 dark:text-success-200 dark:border-success-100/20";
		case "pending":
			return "bg-warning-50 text-warning-700 border-warning-100 dark:bg-warning-50/10 dark:text-warning-200 dark:border-warning-100/20";
		case "failed":
			return "bg-error-50 text-error-700 border-error-100 dark:bg-error-50/10 dark:text-error-200 dark:border-error-100/20";
		default:
			return "bg-muted text-muted-foreground border-border";
	}
};

// Enhanced Payment interface for table display
interface PaymentWithDebt extends Payment {
	debtName: string;
}

export function PaymentTableSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{["skel-1", "skel-2", "skel-3", "skel-4"].map((skel) => (
				<DashboardCardSkeleton key={skel} />
			))}
		</div>
	);
}

// Create column helper for type safety
const columnHelper = createColumnHelper<PaymentWithDebt>();

interface PaymentTableProps {
	payments: PaymentWithDebt[];
	setIsCreateDialogOpen: (open: boolean) => void;
}

export function PaymentTable({
	payments,
	setIsCreateDialogOpen,
}: PaymentTableProps) {
	// Define columns with enhanced styling and status indicators
	const columns = [
		columnHelper.accessor("amount", {
			header: "Amount",
			cell: (info) => (
				<div className="text-center">
					<span className="font-medium font-mono text-contrast-high">
						{formatCurrency(info.getValue())}
					</span>
				</div>
			),
			sortingFn: "basic",
			sortDescFirst: true,
			size: -1,
			minSize: -1,
			maxSize: -1,
		}),
		columnHelper.accessor("paymentDate", {
			header: "Date",
			cell: (info) => {
				const date = info.getValue();
				const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // Within 7 days

				return (
					<div className="text-center">
						<span
							className={cn(
								"text-sm",
								isRecent
									? "font-semibold text-primary"
									: "text-muted-foreground",
							)}
						>
							{date.toLocaleDateString()}
						</span>
						{isRecent && <div className="text-primary text-xs">Recent</div>}
					</div>
				);
			},
			sortingFn: "datetime",
			sortDescFirst: true,
			size: -1,
			minSize: -1,
			maxSize: -1,
		}),
		columnHelper.accessor("debtName", {
			header: "Debt",
			cell: (info) => (
				<div className="font-medium text-contrast-high">{info.getValue()}</div>
			),
			sortingFn: "alphanumeric",
		}),
		columnHelper.accessor("type", {
			header: "Type",
			cell: (info) => (
				<Badge variant="outline" className="capitalize">
					{info.getValue().replace("_", " ")}
				</Badge>
			),
			enableSorting: false,
		}),
		columnHelper.display({
			id: "status",
			header: "Status",
			cell: () => {
				// Mock status - in a real app this would come from the payment data
				const status: PaymentStatus = "completed";
				return (
					<div className="text-center">
						<Badge className={cn("text-xs", getStatusColor(status))}>
							{status}
						</Badge>
					</div>
				);
			},
			enableSorting: false,
		}),
	];

	// Create table instance
	const table = useReactTable({
		columns,
		data: payments,
		enableSorting: true,
		enableSortingRemoval: false,
		enableMultiSort: true,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		initialState: {
			sorting: [{ id: "paymentDate", desc: true }], // Default sort by date, newest first
		},
	});

	const tableHeaderGroups = table.getHeaderGroups();
	const tableHeaders = useMemo(() => {
		return tableHeaderGroups.map((headerGroup) => (
			<TableRow key={headerGroup.id} className="border-b-2">
				{headerGroup.headers.map((header) => {
					return (
						<TableHead
							key={header.id}
							className={cn(
								"font-semibold text-foreground",
								header.column.getCanSort()
									? "cursor-pointer select-none transition-colors hover:bg-muted/50"
									: "",
							)}
							onClick={header.column.getToggleSortingHandler()}
						>
							<div
								className={cn(
									"flex items-center gap-2",
									header.column.getSize() === -1 && "justify-center",
								)}
							>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
								{header.column.getCanSort() && (
									<div className="flex items-center">
										{header.column.getIsSorted() === "asc" ? (
											<ArrowUp className="h-4 w-4 text-primary" />
										) : header.column.getIsSorted() === "desc" ? (
											<ArrowDown className="h-4 w-4 text-primary" />
										) : (
											<ArrowUpDown className="h-4 w-4 opacity-50" />
										)}
									</div>
								)}
							</div>
						</TableHead>
					);
				})}
			</TableRow>
		));
	}, [tableHeaderGroups]);

	return (
		<>
			{payments.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="mb-6 rounded-full bg-gradient-primary p-4">
						<CreditCard className="h-12 w-12 text-primary-foreground" />
					</div>
					<h3 className="mb-2 font-semibold text-xl">
						No payments recorded yet
					</h3>
					<p className="mb-6 max-w-md text-muted-foreground">
						Start by recording your first payment to track your debt repayment
						progress and see your financial journey unfold.
					</p>
					<Button
						onClick={() => setIsCreateDialogOpen(true)}
						className="interactive-primary hover-lift"
						size="lg"
					>
						<Plus className="mr-2 h-5 w-5" />
						Record Your First Payment
					</Button>
				</div>
			) : (
				<div className="card-enhanced overflow-hidden">
					<Table>
						<TableHeader className="table-header-enhanced">
							{tableHeaders}
						</TableHeader>

						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => {
									return (
										<TableRow key={row.id} className="table-row-enhanced">
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													className="table-cell-enhanced"
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center text-muted-foreground"
									>
										No results found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}
		</>
	);
}
