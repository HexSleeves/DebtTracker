import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { api, convex } from "~/lib/convex/client";

export async function GET() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const debts = await convex.query(api.debt.list, { userId });
		return NextResponse.json(debts);
	} catch (error) {
		console.error("Failed to fetch debts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch debts" },
			{ status: 500 },
		);
	}
}
