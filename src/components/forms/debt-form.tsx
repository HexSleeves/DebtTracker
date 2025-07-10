"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
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
import { ZCreateDebt } from "~/server/api/routers/debt/debt.schema";

const formSchema = ZCreateDebt;

type DebtFormProps = {
	onSubmit: (values: z.infer<typeof formSchema>) => void;
	isLoading?: boolean;
};

export function DebtForm({ onSubmit, isLoading }: DebtFormProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			type: "credit_card",
			balance: 0,
			interestRate: 0,
			minimumPayment: 0,
		},
	});

	function handleSubmit(values: z.infer<typeof formSchema>) {
		onSubmit(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Debt Name</FormLabel>
							<FormControl>
								<Input placeholder="Credit Card 1" {...field} />
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
							<FormLabel>Debt Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select debt type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="credit_card">Credit Card</SelectItem>
									<SelectItem value="loan">Personal Loan</SelectItem>
									<SelectItem value="mortgage">Mortgage</SelectItem>
									<SelectItem value="other">Other</SelectItem>
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
							<FormItem>
								<FormLabel>Current Balance</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										placeholder="5000.00"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
								</FormControl>
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
										placeholder="18.99"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="minimumPayment"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Minimum Payment</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										placeholder="150.00"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
								</FormControl>
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
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={cn(
													"w-full pl-3 text-left font-normal",
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
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Adding Debt..." : "Add Debt"}
				</Button>
			</form>
		</Form>
	);
}
