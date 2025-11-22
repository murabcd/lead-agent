import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
	title: "Lead Agent - Inbound Lead Qualification",
	description:
		"Submit your lead information for AI-powered qualification and research.",
};

export default function Home() {
	return (
		<main>
			<LeadForm />
		</main>
	);
}
