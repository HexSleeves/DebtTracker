import * as z from "zod/v4";

// Create a debt
export const ZCreateDebt = z.object({
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
export type TCreateDebt = z.infer<typeof ZCreateDebt>;

// Update a debt
export const ZUpdateDebt = z.object({
  id: z.uuid(),
  name: z.string().min(1, "Debt name is required").optional(),
  type: z.enum(["credit_card", "loan", "mortgage", "other"]).optional(),
  balance: z.number().min(0, "Balance must be positive").optional(),
  interestRate: z.number().min(0, "Interest rate must be positive").optional(),
  minimumPayment: z
    .number()
    .min(0, "Minimum payment must be positive")
    .optional(),
  dueDate: z.date().optional().nullable(),
});
export type TUpdateDebt = z.infer<typeof ZUpdateDebt>;

// Get a debt by ID
export const ZGetDebtById = z.object({
  id: z.uuid(),
});
export type TGetDebtById = z.infer<typeof ZGetDebtById>;

// Delete a debt
export const ZDeleteDebt = z.object({
  id: z.uuid(),
});
export type TDeleteDebt = z.infer<typeof ZDeleteDebt>;
