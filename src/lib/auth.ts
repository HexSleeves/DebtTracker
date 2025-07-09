import { auth } from "@clerk/nextjs/server";

export const getCurrentUser = async () => {
  return await auth();
};

export const requireAuth = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
};
