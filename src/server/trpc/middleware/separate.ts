import { initTRPC } from "@trpc/server";

const t = initTRPC.context<unknown>().create();

export const serverOnlyProcedure = t.procedure.use(async ({ next }) => {
	const result = await next();
	return result;
});
