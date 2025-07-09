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
import type { CreatePaymentInput } from "~/types";

const paymentSchema = z.object({
	debtId: z.string().min(1, "Please select a debt"),
	amount: z.number().min(0.01, "Payment amount must be greater than 0"),
	paymentDate: z.date(),
	type: z.enum(["minimum", "extra", "full"]),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
	debts: Array<{ id: string; name: string; balance: number }>;
	onSubmit: (data: CreatePaymentInput) => void;
	isLoading?: boolean;
}

const paymentTypeOptions = [
	{ value: "minimum", label: "Minimum Payment" },
	{ value: "extra", label: "Extra Payment" },
	{ value: "full", label: "Full Payment" },
] as const;

export function PaymentForm({
	debts,
	onSubmit,
	isLoading = false,
}: PaymentFormProps) {
	const form = useForm<PaymentFormData>({
		resolver: zodResolver(paymentSchema),
		defaultValues: {
			debtId: "",
			amount: 0,
			paymentDate: new Date(),
			type: "minimum",
		},
	});

	const handleFormSubmit = (data: PaymentFormData) => {
		onSubmit(data);
		form.reset();
	};

	return (
		<Card className="mx-auto w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Log Payment</CardTitle>
				<CardDescription>
					Record a payment you've made towards one of your debts.
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
							name="debtId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Select Debt</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Choose which debt you paid" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{debts.map((debt) => (
												<SelectItem key={debt.id} value={debt.id}>
													{debt.name} (${debt.balance.toFixed(2)})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Select the debt you made a payment towards.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Payment Amount ($)</FormLabel>
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
											Amount you paid towards this debt.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="paymentDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Payment Date</FormLabel>
										<FormControl>
											<Input
												type="date"
												{...field}
												value={
													field.value
														? field.value.toISOString().split("T")[0]
														: ""
												}
												onChange={(e) =>
													field.onChange(new Date(e.target.value))
												}
											/>
										</FormControl>
										<FormDescription>
											When did you make this payment?
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Payment Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select payment type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{paymentTypeOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Was this a minimum payment, extra payment, or full payoff?
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => form.reset()}
								disabled={isLoading}
							>
								Reset
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Recording..." : "Record Payment"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
