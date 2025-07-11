"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export interface NumberFieldProps<T extends FieldValues>
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  label?: string;
  required?: boolean;
  field: ControllerRenderProps<T, FieldPath<T>>;
  /**
   * Number of decimal places to allow
   * @default 2
   */
  decimalPlaces?: number;
  /**
   * Minimum value allowed
   */
  min?: number;
  /**
   * Maximum value allowed
   */
  max?: number;
  /**
   * Whether to format the number with thousands separators when not focused
   * @default true
   */
  formatWithSeparators?: boolean;
  /**
   * Whether to allow negative numbers
   * @default false
   */
  allowNegative?: boolean;
  /**
   * Prefix to display (e.g., "%" for percentages)
   */
  prefix?: string;
  /**
   * Suffix to display (e.g., "%" for percentages)
   */
  suffix?: string;
}

/**
 * Formats a number with thousands separators
 */
function formatNumber(
  value: number,
  decimalPlaces = 2,
  formatWithSeparators = true,
): string {
  if (formatWithSeparators) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces,
    });
  }
  return value.toFixed(decimalPlaces).replace(/\.?0+$/, "");
}

/**
 * Parses a string input to a number, removing formatting
 */
function parseNumber(input: string, allowNegative = false): number {
  const cleanedInput = allowNegative
    ? input.replace(/[^0-9.-]/g, "")
    : input.replace(/[^0-9.]/g, "");

  const parsed = Number.parseFloat(cleanedInput);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const NumberField = <T extends FieldValues>(
  props: NumberFieldProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => {
  const {
    ref,
    min,
    max,
    field,
    label,
    prefix,
    suffix,
    required,
    className,
    decimalPlaces = 2,
    allowNegative = false,
    formatWithSeparators = true,
    ...restProps
  } = props;

  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    const numericValue = String(
      typeof field.value === "number" ? field.value : (field.value ?? ""),
    );

    // Remove formatting and show raw number for editing
    const cleanValue = allowNegative
      ? numericValue.replace(/[^0-9.-]/g, "")
      : numericValue.replace(/[^0-9.]/g, "");

    // Clear the input if the value is exactly "0" to prevent typing "010", "020", etc.
    if (cleanValue === "0") {
      setDisplayValue("");
    } else {
      setDisplayValue(cleanValue);
    }
  }, [field.value, allowNegative]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      // Allow typing decimal points and negative signs
      const allowedChars = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
      const numericValue = inputValue.replace(allowedChars, "");

      // Prevent multiple decimal points
      const decimalCount = (numericValue.match(/\./g) ?? []).length;
      if (decimalCount > 1) {
        return;
      }

      // Prevent multiple negative signs or negative signs not at start
      if (allowNegative) {
        const negativeCount = (numericValue.match(/-/g) ?? []).length;
        const negativeIndex = numericValue.indexOf("-");
        if (
          negativeCount > 1 ||
          (negativeIndex !== -1 && negativeIndex !== 0)
        ) {
          return;
        }
      }

      setDisplayValue(numericValue);

      // Parse and validate the value
      const parsedValue = parseNumber(numericValue, allowNegative);
      field.onChange(parsedValue);
    },
    [field, allowNegative],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    const numericValue =
      typeof field.value === "number"
        ? field.value
        : parseNumber(displayValue, allowNegative);

    // Apply min/max constraints on blur
    let finalValue = numericValue;
    if (min !== undefined && finalValue < min) {
      finalValue = min;
      field.onChange(finalValue);
    }
    if (max !== undefined && finalValue > max) {
      finalValue = max;
      field.onChange(finalValue);
    }

    // Format the display value
    if (finalValue !== 0 || displayValue !== "") {
      const formatted = formatNumber(
        finalValue,
        decimalPlaces,
        formatWithSeparators,
      );
      setDisplayValue(formatted);
    } else {
      setDisplayValue("");
    }

    field.onBlur();
  }, [
    field,
    displayValue,
    allowNegative,
    min,
    max,
    decimalPlaces,
    formatWithSeparators,
  ]);

  const inputValue = useMemo(() => {
    if (isFocused) {
      return displayValue;
    }

    if (displayValue && !isFocused) {
      return displayValue;
    }

    if (field.value !== undefined && typeof field.value === "number") {
      // Show zero values when they exist
      if (field.value === 0) {
        return "0";
      }
      return formatNumber(field.value, decimalPlaces, formatWithSeparators);
    }

    if (field.value && typeof field.value === "string" && field.value !== "") {
      const parsed = parseNumber(field.value, allowNegative);
      return formatNumber(parsed, decimalPlaces, formatWithSeparators);
    }

    return "";
  }, [
    isFocused,
    displayValue,
    field.value,
    decimalPlaces,
    formatWithSeparators,
    allowNegative,
  ]);

  // Format the display value with prefix/suffix
  const formattedInputValue = useMemo(() => {
    if (!inputValue) return "";

    let formatted = inputValue;
    if (prefix && !isFocused) formatted = `${prefix}${formatted}`;
    if (suffix && !isFocused) formatted = `${formatted}${suffix}`;

    return formatted;
  }, [inputValue, prefix, suffix, isFocused]);

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <Input
          ref={ref}
          id={field.name}
          name={field.name}
          type="text"
          value={formattedInputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...restProps}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

NumberField.displayName = "NumberField";
