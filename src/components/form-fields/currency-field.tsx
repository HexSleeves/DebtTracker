"use client";

import { DollarSign } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from "react-hook-form";
import { formatCurrency, parseCurrency } from "~/lib/currency";
import { cn } from "~/lib/utils";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export interface CurrencyFieldProps<T extends FieldValues>
	extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
	label?: string;
	required?: boolean;
	field: ControllerRenderProps<T, FieldPath<T>>;
}

export const CurrencyField = <T extends FieldValues>(
	props: CurrencyFieldProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => {
	const { field, label, required, className, ref, ...restProps } = props;
	const [displayValue, setDisplayValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
		const numericValue =
			typeof field.value === "number"
				? field.value.toString()
				: field.value || "";

		// Remove formatting and show raw number for editing
		const cleanValue = numericValue.replace(/[^0-9.]/g, "");

		// Clear the input if the value is exactly "0" to prevent typing "010", "020", etc.
		if (cleanValue === "0") {
			setDisplayValue("");
		} else {
			setDisplayValue(cleanValue);
		}
	}, [field.value]);

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = event.target.value;
			const numericValue = inputValue.replace(/[^0-9.]/g, "");
			setDisplayValue(numericValue);

			const parsedValue = parseCurrency(numericValue).value;
			field.onChange(parsedValue);
		},
		[field],
	);

	const handleBlur = useCallback(() => {
		setIsFocused(false);

		const numericValue =
			typeof field.value === "number"
				? field.value
				: parseCurrency(displayValue).value;
		if (numericValue > 0) {
			setDisplayValue(formatCurrency(numericValue));
		} else {
			setDisplayValue("");
		}

		field.onBlur();
	}, [field, displayValue]);

	const inputValue = useMemo(() => {
		if (isFocused || (displayValue && !isFocused)) {
			return displayValue;
		}
		if (field.value && typeof field.value === "number" && field.value > 0) {
			return formatCurrency(field.value);
		}
		if (field.value && typeof field.value === "string" && field.value !== "") {
			return formatCurrency(parseCurrency(field.value).value);
		}
		return "";
	}, [isFocused, displayValue, field.value]);

	return (
		<FormItem className={className}>
			{label && (
				<FormLabel className="font-medium text-sm">
					{label}
					{required && <span className="text-destructive">*</span>}
				</FormLabel>
			)}
			<FormControl>
				<div className="relative">
					<DollarSign className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						ref={ref}
						id={field.name}
						name={field.name}
						type="text"
						value={inputValue}
						className={cn("pl-10")}
						onChange={handleChange}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...restProps}
					/>
				</div>
			</FormControl>
			<FormMessage />
		</FormItem>
	);
};

CurrencyField.displayName = "CurrencyField";
