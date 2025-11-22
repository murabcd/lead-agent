import type { Metadata } from "next";
import { knowledgeBase } from "@/lib/knowledge-base";
import { KnowledgeForm } from "./knowledge-form";

export const metadata: Metadata = {
	title: "Knowledge Base | Lead Agent",
	description:
		"Upload your company information to help the lead agent compare leads against your business.",
};

// Force dynamic rendering since knowledge base is in-memory and changes per request
export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
	// Fetch count on the server so it's available immediately
	const count = knowledgeBase.getCount();

	return <KnowledgeForm initialCount={count} />;
}
