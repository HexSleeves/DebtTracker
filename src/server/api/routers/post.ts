import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // This is a placeholder - in a real app you'd save to database
      return {
        id: "1",
        name: input.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    // This is a placeholder - in a real app you'd fetch from database
    return {
      id: "1",
      name: "Latest Post",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),
});
