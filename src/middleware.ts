import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/debts(.*)",
	"/payments(.*)",
	"/plans(.*)",
	"/profile(.*)",
]);

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	if (!isPublicRoute(req) && isProtectedRoute(req)) {
		await auth.protect();
	}
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
