"use client";

import {
	CalendarDays,
	CreditCard,
	DollarSign,
	Filter,
	Plus,
	Search,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "~/components/stats-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { formatCurrency } from "~/lib/currency";
import type { TCreatePayment } from "~/server/api/routers/payment/payment.schema";
import { api } from "~/trpc/react";
import { PaymentTable } from "../_components/payment-table";

type PaymentMethod =
	| "credit_card"
	| "bank_transfer"
	| "cash"
	| "check"
	| "other";

interface PaymentFormData {
	debtId: string;
	amount: number;
	paymentDate: Date;
	type: "minimum" | "extra" | "full";
	paymentMethod: PaymentMethod;
	notes?: string;
}

export default function PaymentsPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterDebt, setFilterDebt] = useState<string>("all");
	const [filterStatus, setFilterStatus] = useState<string>("all");

	// Form state
	const [formData, setFormData] = useState<PaymentFormData>({
		debtId: "",
		amount: 0,
		paymentDate: new Date(),
		type: "minimum",
		paymentMethod: "credit_card",
		notes: "",
	});

	const utils = api.useUtils();
	const { data: payments = [], isLoading: paymentsLoading } =
		api.payment.getAll.useQuery();

	const { data: debts = [], isLoading: debtsLoading } =
		api.debt.getAll.useQuery();

	const createPaymentMutation = api.payment.create.useMutation({
		onSuccess: (data) => {
			utils.payment.getAll.setData(undefined, (old = []) => [data, ...old]);
			toast.success("Payment recorded successfully");
			setIsCreateDialogOpen(false);
			resetForm();
			void utils.payment.getAll.invalidate();
			void utils.debt.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(`Failed to record payment: ${error.message}`);
		},
	});

	const resetForm = () => {
		setFormData({
			debtId: "",
			amount: 0,
			paymentDate: new Date(),
			type: "minimum",
			paymentMethod: "credit_card",
			notes: "",
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.debtId) {
			toast.error("Please select a debt");
			return;
		}

		if (formData.amount <= 0) {
			toast.error("Payment amount must be greater than 0");
			return;
		}

		const createData: TCreatePayment = {
			debtId: formData.debtId,
			amount: formData.amount,
			paymentDate: formData.paymentDate,
			type: formData.type,
			paymentMethod: formData.paymentMethod,
			notes: formData.notes,
		};

		createPaymentMutation.mutate(createData);
	};

	// Calculate payment statistics
	const paymentStats = useMemo(() => {
		const totalPayments = payments.reduce(
			(sum, payment) => sum + payment.amount,
			0,
		);
		const averagePayment =
			payments.length > 0 ? totalPayments / payments.length : 0;
		const thisMonthPayments = payments.filter((payment) => {
			const paymentDate = new Date(payment.paymentDate);
			const now = new Date();
			return (
				paymentDate.getMonth() === now.getMonth() &&
				paymentDate.getFullYear() === now.getFullYear()
			);
		});
		const thisMonthTotal = thisMonthPayments.reduce(
			(sum, payment) => sum + payment.amount,
			0,
		);

		return {
			totalPayments,
			averagePayment,
			paymentCount: payments.length,
			thisMonthTotal,
			thisMonthCount: thisMonthPayments.length,
		};
	}, [payments]);

	// Filter payments and add debt names
	const filteredPayments = useMemo(() => {
		let filtered = payments.map((payment) => {
			const debt = debts.find((d) => d.id === payment.debtId);
			return {
				...payment,
				debtName: debt?.name ?? "Unknown Debt",
			};
		});

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter((payment) => {
				return (
					payment.debtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					payment.amount.toString().includes(searchTerm)
				);
			});
		}

		// Apply debt filter
		if (filterDebt !== "all") {
			filtered = filtered.filter((payment) => payment.debtId === filterDebt);
		}

		// Apply status filter (mock status for now)
		if (filterStatus !== "all") {
			// In a real app, this would filter by actual payment status
			// For now, we'll just return all payments since we don't have status in the schema
		}

		return filtered;
	}, [payments, debts, searchTerm, filterDebt, filterStatus]);

	if (paymentsLoading || debtsLoading) {
		return (
			<div className="space-y-8">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h1 className="font-bold text-3xl tracking-tight">Payments</h1>
						<p className="text-muted-foreground">
							Track your payment history and record new payments
						</p>
					</div>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="animate-pulse">
							<div className="h-32 rounded-lg bg-muted" />
						</div>
					))}
				</div>
				<div className="animate-pulse">
					<div className="mb-4 h-10 rounded bg-muted" />
					<div className="h-64 rounded bg-muted" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="font-bold text-3xl tracking-tight">Payment History</h1>
					<p className="text-muted-foreground">
						Track your payment history and record new payments
					</p>
				</div>
				<Button
					onClick={() => setIsCreateDialogOpen(true)}
					className="interactive-primary hover-lift"
				>
					<Plus className="mr-2 h-4 w-4" />
					Record Payment
				</Button>
			</div>

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Payments"
					value={formatCurrency(paymentStats.totalPayments)}
					subtitle={`${paymentStats.paymentCount} payments`}
					icon={<DollarSign className="h-6 w-6" />}
					color="blue"
					trend="neutral"
					className="hover-lift"
				/>

				<StatCard
					title="Average Payment"
					value={formatCurrency(paymentStats.averagePayment)}
					subtitle="Per payment"
					icon={<TrendingUp className="h-6 w-6" />}
					color="green"
					trend="up"
					className="hover-lift"
				/>

				<StatCard
					title="This Month"
					value={formatCurrency(paymentStats.thisMonthTotal)}
					subtitle={`${paymentStats.thisMonthCount} payments`}
					icon={<CalendarDays className="h-6 w-6" />}
					color="blue"
					trend="neutral"
					className="hover-lift"
				/>

				<StatCard
					title="Payment Frequency"
					value={
						paymentStats.paymentCount > 0
							? `${(paymentStats.paymentCount / Math.max(1, Math.ceil((Date.now() - new Date(payments[payments.length - 1]?.paymentDate ?? Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)))).toFixed(1)}/mo`
							: "0/mo"
					}
					subtitle="Average per month"
					icon={<CreditCard className="h-6 w-6" />}
					color="amber"
					trend="neutral"
					className="hover-lift"
				/>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filter & Search
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="search">Search</Label>
							<div className="relative">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Search payments..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="debt-filter">Debt</Label>
							<Select value={filterDebt} onValueChange={setFilterDebt}>
								<SelectTrigger>
									<SelectValue placeholder="All debts" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All debts</SelectItem>
									{debts.map((debt) => (
										<SelectItem key={debt.id} value={debt.id}>
											{debt.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status-filter">Status</Label>
							<Select value={filterStatus} onValueChange={setFilterStatus}>
								<SelectTrigger>
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All statuses</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="failed">Failed</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Payment History Table */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-xl">Payment History</h2>
					{filteredPayments.length > 0 && (
						<p className="text-muted-foreground text-sm">
							Showing {filteredPayments.length} of {payments.length} payments
						</p>
					)}
				</div>

				<PaymentTable
					payments={filteredPayments}
					setIsCreateDialogOpen={setIsCreateDialogOpen}
				/>
			</div>

			{/* Create Payment Dialog */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Plus className="h-5 w-5" />
							Record Payment
						</DialogTitle>
						<DialogDescription>
							Record a new payment towards one of your debts.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="debt">Debt *</Label>
							<Select
								value={formData.debtId}
								onValueChange={(value) =>
									setFormData({ ...formData, debtId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a debt" />
								</SelectTrigger>
								<SelectContent>
									{debts.map((debt) => (
										<SelectItem key={debt.id} value={debt.id}>
											{debt.name} - {formatCurrency(debt.balance)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount *</Label>
							<div className="relative">
								<DollarSign className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="amount"
									type="number"
									step="0.01"
									min="0.01"
									placeholder="0.00"
									value={formData.amount || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											amount: Number.parseFloat(e.target.value) || 0,
										})
									}
									className="pl-10"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="date">Payment Date *</Label>
							<Input
								id="date"
								type="date"
								value={formData.paymentDate.toISOString().split("T")[0]}
								onChange={(e) =>
									setFormData({
										...formData,
										paymentDate: new Date(e.target.value),
									})
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="type">Payment Type</Label>
							<Select
								value={formData.type}
								onValueChange={(value: "minimum" | "extra" | "full") =>
									setFormData({ ...formData, type: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select payment type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="minimum">Minimum Payment</SelectItem>
									<SelectItem value="extra">Extra Payment</SelectItem>
									<SelectItem value="full">Full Payment</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="payment-method">Payment Method</Label>
							<Select
								value={formData.paymentMethod}
								onValueChange={(value: PaymentMethod) =>
									setFormData({ ...formData, paymentMethod: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select payment method" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="credit_card">Credit Card</SelectItem>
									<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
									<SelectItem value="cash">Cash</SelectItem>
									<SelectItem value="check">Check</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">Notes (Optional)</Label>
							<Textarea
								id="notes"
								placeholder="Additional notes about this payment..."
								value={formData.notes}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								rows={3}
							/>
						</div>

						<div className="flex gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createPaymentMutation.isPending}
								className="flex-1"
							>
								{createPaymentMutation.isPending
									? "Recording..."
									: "Record Payment"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
