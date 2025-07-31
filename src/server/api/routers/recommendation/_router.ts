import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as handler from "./recommendation.handler";
import * as schema from "./recommendation.schema";

export const recommendationRouter = createTRPCRouter({
	get: protectedProcedure
		.input(schema.ZGetRecommendations)
		.query(handler.getRecommendations),
});
