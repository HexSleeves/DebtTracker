export interface Debt {
  id: string;
  userId: string;
  name: string;
  type: "credit_card" | "loan" | "mortgage" | "other";
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
