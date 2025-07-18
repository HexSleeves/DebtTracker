"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { CurrencyField, NumberField } from "~/components/form-fields";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import {
	type TCreateDebt,
	ZCreateDebt,
} from "~/server/api/routers/debt/debt.schema";

type DebtFormProps = {
	onSubmitAction: (values: TCreateDebt) => void;
	isLoading?: boolean;
	defaultValues?: Partial<TCreateDebt>;
};

export function DebtForm({
	onSubmitAction,
	isLoading,
	defaultValues,
}: DebtFormProps) {
	const form = useForm<TCreateDebt>({
		resolver: zodResolver(ZCreateDebt),
		defaultValues: {
			name: defaultValues?.name ?? "",
			type: defaultValues?.type ?? "credit_card",
			balance: defaultValues?.balance ?? 0,
			originalBalance: defaultValues?.originalBalance,
			interestRate: defaultValues?.interestRate ?? 0,
			minimumPayment: defaultValues?.minimumPayment ?? 0,
			dueDate: defaultValues?.dueDate,
		},
	});

	function handleSubmit(values: TCreateDebt) {
		onSubmitAction(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-medium text-sm">Debt Name</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., Chase Freedom Credit Card"
									className="h-11"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-medium text-sm">Debt Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="h-11 w-full">
										<SelectValue placeholder="Select debt type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="credit_card">💳 Credit Card</SelectItem>
									<SelectItem value="loan">🏦 Personal Loan</SelectItem>
									<SelectItem value="mortgage">🏠 Mortgage</SelectItem>
									<SelectItem value="other">📄 Other</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="balance"
						render={({ field }) => (
							<CurrencyField
								field={field}
								label="Current Balance"
								placeholder="5,000.00"
								className="h-11"
								required
							/>
						)}
					/>

					<FormField
						control={form.control}
						name="originalBalance"
						render={({ field }) => (
							<CurrencyField
								field={field}
								label="Original Amount"
								placeholder="Leave empty to use current balance"
								className="h-11"
								required={false}
							/>
						)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="interestRate"
						render={({ field }) => (
							<NumberField
								field={field}
								label="Interest Rate"
								suffix="%"
								min={0}
								max={100}
								step={0.01}
								decimalPlaces={2}
							/>
						)}
					/>

					<FormField
						control={form.control}
						name="minimumPayment"
						render={({ field }) => (
							<CurrencyField
								field={field}
								label="Minimum Payment"
								placeholder="150.00"
								className="h-11"
								required
							/>
						)}
					/>

					<FormField
						control={form.control}
						name="dueDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="font-medium text-sm">
									Due Date (Optional)
								</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={cn(
													"h-11 w-full justify-start text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value ? (
													field.value.toLocaleDateString()
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) => date < new Date()}
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="submit"
					className="interactive-primary h-11 w-full"
					disabled={isLoading}
				>
					{isLoading
						? defaultValues
							? "Updating Debt..."
							: "Adding Debt..."
						: defaultValues
							? "Update Debt"
							: "Add Debt"}
				</Button>
			</form>
		</Form>
	);
}
