import type { Database } from "./database.types";

export type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
export type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

export type PaymentPlanInsert =
  Database["public"]["Tables"]["payment_plans"]["Insert"];
export type PaymentPlanUpdate =
  Database["public"]["Tables"]["payment_plans"]["Update"];
export type PaymentPlanRow =
  Database["public"]["Tables"]["payment_plans"]["Row"];

export type DebtInsert = Database["public"]["Tables"]["debts"]["Insert"];
export type DebtUpdate = Database["public"]["Tables"]["debts"]["Update"];
export type DebtRow = Database["public"]["Tables"]["debts"]["Row"];
