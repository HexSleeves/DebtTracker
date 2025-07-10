/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import * as z from "zod/v4";
import { createClient } from "~/lib/supabase/server";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
	const { userId } = await auth();

	// Create Supabase client with service role key for server-side operations
	// const supabase = createClient<Database>(
	// 	env.NEXT_PUBLIC_SUPABASE_URL,
	// 	env.SUPABASE_SERVICE_ROLE_KEY,
	// 	{
	// 		async accessToken() {
	// 			return (await auth()).getToken();
	// 		},
	// 		auth: {
	// 			autoRefreshToken: false,
	// 			persistSession: false,
	// 		},
	// 	},
	// );

	const supabase = await createClient();

	return {
		...opts,
		userId,
		supabase,
	};
};

/**
 * Global error handler for tRPC procedures
 */
function handleTRPCError(error: unknown, path: string): TRPCError {
	console.error(`[TRPC Error] ${path}:`, error);

	// Database errors
	if (error && typeof error === "object" && "code" in error) {
		const dbError = error as { code: string; message: string };

		// Supabase/PostgreSQL error codes
		switch (dbError.code) {
			case "23505": // unique violation
				return new TRPCError({
					code: "CONFLICT",
					message: "A record with these details already exists",
					cause: error,
				});
			case "23503": // foreign key violation
				return new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid reference to related data",
					cause: error,
				});
			case "23502": // not null violation
				return new TRPCError({
					code: "BAD_REQUEST",
					message: "Required field is missing",
					cause: error,
				});
			default:
				return new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Database operation failed",
					cause: error,
				});
		}
	}

	// Network/timeout errors
	if (error instanceof Error) {
		if (
			error.message.includes("timeout") ||
			error.message.includes("TIMEOUT")
		) {
			return new TRPCError({
				code: "TIMEOUT",
				message: "Request timed out. Please try again.",
				cause: error,
			});
		}

		if (
			error.message.includes("network") ||
			error.message.includes("NETWORK")
		) {
			return new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Network error occurred. Please check your connection.",
				cause: error,
			});
		}
	}

	// Already a tRPC error
	if (error instanceof TRPCError) {
		return error;
	}

	// Generic error fallback
	return new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: "An unexpected error occurred",
		cause: error,
	});
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof z.ZodError ? error.cause.flatten() : null,
				timestamp: new Date().toISOString(),
			},
		};
	},
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Enhanced logging middleware for debugging and monitoring
 */
const loggingMiddleware = t.middleware(async ({ next, path, type, input }) => {
	const start = Date.now();
	const requestId = Math.random().toString(36).substr(2, 9);

	console.log(`[TRPC] ${requestId} - ${type} ${path} - Started`, {
		input: process.env.NODE_ENV === "development" ? input : "[HIDDEN]",
		timestamp: new Date().toISOString(),
	});

	const result = await next().catch((error) => {
		const handledError = handleTRPCError(error, path);

		console.error(`[TRPC] ${requestId} - ${type} ${path} - Error:`, {
			error: handledError.message,
			code: handledError.code,
			duration: Date.now() - start,
			timestamp: new Date().toISOString(),
		});

		throw handledError;
	});

	const duration = Date.now() - start;
	console.log(
		`[TRPC] ${requestId} - ${type} ${path} - Completed in ${duration}ms`,
	);

	return result;
});

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next }) => {
	if (t._config.isDev) {
		// artificial delay in dev - reduced for better development experience
		const waitMs = Math.floor(Math.random() * 200) + 50;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}

	return next();
});

/**
 * Rate limiting middleware to prevent abuse
 */
const rateLimitMiddleware = t.middleware(async ({ next }) => {
	// In production, you might want to implement proper rate limiting
	// For now, we'll just log potentially suspicious activity
	if (process.env.NODE_ENV === "production") {
		// You could implement rate limiting logic here
		// For example, using Redis to track requests per user/IP
	}

	return next();
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
	.use(loggingMiddleware)
	.use(timingMiddleware)
	.use(rateLimitMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.userId` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
	.use(loggingMiddleware)
	.use(timingMiddleware)
	.use(rateLimitMiddleware)
	.use(({ ctx, next }) => {
		if (!ctx.userId) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "You must be logged in to perform this action",
			});
		}
		return next({
			ctx: {
				...ctx,
				userId: ctx.userId,
			},
		});
	});

/**
 * Enhanced procedure with additional validation and error handling
 */
export const enhancedProcedure = protectedProcedure.use(async ({ next }) => {
	// Additional validation or setup can be done here
	// For example, checking user permissions, setting up additional context, etc.

	try {
		return await next();
	} catch (error) {
		// Additional error handling if needed
		throw error;
	}
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
export type ProtectedTRPCContext = TRPCContext & {
	userId: NonNullable<TRPCContext["userId"]>;
};

// Export error handler for use in other parts of the application
export { handleTRPCError };
