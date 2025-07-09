"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const debtSchema = z.object({
	name: z.string().min(1, "Debt name is required"),
	type: z.enum(["credit_card", "loan", "mortgage", "other"]),
	balance: z.number().min(0, "Balance must be positive"),
	interestRate: z
		.number()
		.min(0, "Interest rate must be positive")
		.max(100, "Interest rate cannot exceed 100%"),
	minimumPayment: z.number().min(0, "Minimum payment must be positive"),
	dueDate: z.date().optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

interface DebtFormProps {
	onSubmit: (data: DebtFormData) => void;
	isLoading?: boolean;
}

const debtTypeOptions = [
	{ value: "credit_card", label: "Credit Card" },
	{ value: "loan", label: "Personal Loan" },
	{ value: "mortgage", label: "Mortgage" },
	{ value: "other", label: "Other" },
] as const;

export function DebtForm({ onSubmit, isLoading = false }: DebtFormProps) {
	const form = useForm<DebtFormData>({
		resolver: zodResolver(debtSchema),
		defaultValues: {
			name: "",
			type: "credit_card",
			balance: 0,
			interestRate: 0,
			minimumPayment: 0,
		},
	});

	const handleFormSubmit = (data: DebtFormData) => {
		onSubmit(data);
		form.reset();
	};

	return (
		<Card className="mx-auto w-full max-w-2xl">
			<CardHeader>
				<CardTitle>Add New Debt</CardTitle>
				<CardDescription>
					Enter the details of your debt to start tracking and optimizing your
					repayment strategy.
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
									<FormLabel>Debt Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Chase Credit Card" {...field} />
									</FormControl>
									<FormDescription>
										Give your debt a recognizable name for easy identification.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Debt Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select debt type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{debtTypeOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Choose the type that best describes this debt.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="balance"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Current Balance ($)</FormLabel>
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
											The current outstanding balance.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="interestRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Interest Rate (%)</FormLabel>
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
											Annual Percentage Rate (APR).
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="minimumPayment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Minimum Payment ($)</FormLabel>
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
											Required monthly minimum payment.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="dueDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Due Date (Optional)</FormLabel>
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
													field.onChange(
														e.target.value
															? new Date(e.target.value)
															: undefined,
													)
												}
											/>
										</FormControl>
										<FormDescription>Monthly payment due date.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
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
							<Button type="submit" disabled={isLoading}>
								{isLoading ? "Adding..." : "Add Debt"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
