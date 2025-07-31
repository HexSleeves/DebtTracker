import { debtRouter } from "~/server/api/routers/debt/_router";
import { paymentRouter } from "~/server/api/routers/payment/_router";
import { paymentPlanRouter } from "~/server/api/routers/paymentPlan/_router";
import { postRouter } from "~/server/api/routers/post";
import { progressRouter } from "~/server/api/routers/progress/_router";
import { recommendationRouter } from "~/server/api/routers/recommendation/_router";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	debt: debtRouter,
	payment: paymentRouter,
	paymentPlan: paymentPlanRouter,
	progress: progressRouter,
	recommendation: recommendationRouter,
	post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
