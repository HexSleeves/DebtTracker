"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod/v4";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { CreatePaymentPlanInput } from "~/types";

const budgetSchema = z.object({
	name: z.string().min(1, "Plan name is required"),
	monthlyBudget: z.number().min(0.01, "Monthly budget must be greater than 0"),
	strategy: z.enum(["avalanche", "snowball", "custom"]),
	extraPayment: z
		.number()
		.min(0, "Extra payment must be 0 or greater")
		.optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
	onSubmit: (data: CreatePaymentPlanInput) => void;
	isLoading?: boolean;
	totalMinimumPayments?: number;
}

const strategyOptions = [
	{
		value: "avalanche",
		label: "Debt Avalanche",
		description:
			"Pay minimums on all debts, then focus extra payments on highest interest rate debt first",
	},
	{
		value: "snowball",
		label: "Debt Snowball",
		description:
			"Pay minimums on all debts, then focus extra payments on smallest balance debt first",
	},
	{
		value: "custom",
		label: "Custom Strategy",
		description: "Manually choose which debts to prioritize for extra payments",
	},
] as const;

export function BudgetForm({
	onSubmit,
	isLoading = false,
	totalMinimumPayments = 0,
}: BudgetFormProps) {
	const form = useForm<BudgetFormData>({
		resolver: zodResolver(budgetSchema),
		defaultValues: {
			name: "My Payment Plan",
			monthlyBudget: totalMinimumPayments,
			strategy: "avalanche",
			extraPayment: 0,
		},
	});

	const watchedBudget = form.watch("monthlyBudget");
	const extraPayment = Math.max(0, watchedBudget - totalMinimumPayments);

	const handleFormSubmit = (data: BudgetFormData) => {
		const submitData: CreatePaymentPlanInput = {
			name: data.name,
			strategy: data.strategy,
			monthlyBudget: data.monthlyBudget,
			extraPayment: data.extraPayment ?? extraPayment,
		};
		onSubmit(submitData);
	};

	return (
		<Card className="mx-auto w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Set Payment Budget & Strategy</CardTitle>
				<CardDescription>
					Configure your monthly debt payment budget and choose your repayment
					strategy.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="space-y-6"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Plan Name</FormLabel>
									<FormControl>
										<Input placeholder="My Payment Plan" {...field} />
									</FormControl>
									<FormDescription>
										Give your payment plan a descriptive name.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="monthlyBudget"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Monthly Debt Payment Budget ($)</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											placeholder="0.00"
											{...field}
											onChange={(e) =>
												field.onChange(Number.parseFloat(e.target.value) || 0)
											}
										/>
									</FormControl>
									<FormDescription>
										Total amount you can allocate to debt payments each month.
										{totalMinimumPayments > 0 && (
											<span className="mt-1 block">
												Minimum payments required: $
												{totalMinimumPayments.toFixed(2)}
												{extraPayment > 0 && (
													<span className="font-medium text-green-600">
														{" "}
														• Extra payment available: $
														{extraPayment.toFixed(2)}
													</span>
												)}
												{watchedBudget < totalMinimumPayments && (
													<span className="font-medium text-red-600">
														{" "}
														• Warning: Budget is less than minimum payments
														required
													</span>
												)}
											</span>
										)}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="strategy"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Repayment Strategy</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Choose your repayment strategy" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{strategyOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													<div className="flex flex-col">
														<span className="font-medium">{option.label}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										{
											strategyOptions.find(
												(opt) => opt.value === form.watch("strategy"),
											)?.description
										}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="rounded-lg bg-muted p-4">
							<h4 className="mb-2 font-medium">Strategy Comparison</h4>
							<div className="space-y-1 text-muted-foreground text-sm">
								<p>
									<strong>Debt Avalanche:</strong> Mathematically optimal -
									saves the most money on interest
								</p>
								<p>
									<strong>Debt Snowball:</strong> Psychologically motivating -
									provides quick wins by eliminating smaller debts first
								</p>
								<p>
									<strong>Custom Strategy:</strong> Flexible approach - you
									decide which debts to prioritize
								</p>
							</div>
						</div>

						<div className="flex justify-end space-x-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => form.reset()}
								disabled={isLoading}
							>
								Reset
							</Button>
							<Button
								type="submit"
								disabled={isLoading || watchedBudget < totalMinimumPayments}
							>
								{isLoading ? "Saving..." : "Save Budget & Strategy"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
