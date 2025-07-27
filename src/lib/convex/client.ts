import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL as string;

export const convex = new ConvexHttpClient(convexUrl);

export { api };
