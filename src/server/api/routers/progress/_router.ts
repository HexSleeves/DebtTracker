import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as handler from "./progress.handler";
import * as schema from "./progress.schema";

export const progressRouter = createTRPCRouter({
	getDebtProgress: protectedProcedure
		.input(schema.ZGetDebtProgress)
		.query(handler.getDebtProgress),
	getAll: protectedProcedure.query(handler.getAllProgress),
});
