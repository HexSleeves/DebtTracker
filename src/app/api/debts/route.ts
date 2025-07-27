import { NextResponse } from "next/server";
import { api, convex } from "~/lib/convex/client";

export async function GET() {
	const userId = "test";
	const debts = await convex.query(api.debt.list, { userId });
	return NextResponse.json(debts);
}
