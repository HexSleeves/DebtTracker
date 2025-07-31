import * as z from "zod/v4";

export const ZGetRecommendations = z.object({
	monthlyBudget: z.number().min(0.01),
	strategy: z.enum(["avalanche", "snowball"]),
});
export type TGetRecommendations = z.infer<typeof ZGetRecommendations>;
