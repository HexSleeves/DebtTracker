export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  clerkUserId: string;
  email: string;
}
