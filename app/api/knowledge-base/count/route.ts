import { NextResponse } from "next/server";
import { knowledgeBase } from "@/lib/knowledge-base";

/**
 * GET /api/knowledge-base/count
 * Get the current count of entries in the knowledge base
 */
export async function GET() {
	try {
		const count = knowledgeBase.getCount();
		const companyName = knowledgeBase.getCompanyName();

		console.log(
			`📊 Knowledge base status check: ${count} entries, company: "${companyName || "not set"}"`,
		);

		return NextResponse.json({
			count,
			companyName: companyName || null,
		});
	} catch (error) {
		console.error("Error getting knowledge base count:", error);
		return NextResponse.json(
			{ error: "Failed to get knowledge base count" },
			{ status: 500 },
		);
	}
}
