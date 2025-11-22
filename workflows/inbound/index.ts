import type { FormSchema } from "@/lib/types";
import {
	stepHumanFeedback,
	stepQualify,
	stepResearch,
	stepWriteEmail,
} from "./steps";

/**
 * workflow to handle the inbound lead
 * - research the lead
 * - qualify the lead
 * - if the lead is qualified or follow up:
 *   - write an email for the lead
 *   - get human feedback for the email
 *   - send the email to the human for approval
 * - if the lead is not qualified or follow up:
 *   - take other actions here based on other qualification categories
 */
export const workflowInbound = async (data: FormSchema) => {
	"use workflow";

	console.log("🚀 Starting inbound workflow for lead:", data.email);

	try {
		const research = await stepResearch(data);
		console.log("✅ Research completed");

		const qualification = await stepQualify(data, research);
		console.log("✅ Qualification completed:", qualification.category);

		if (
			qualification.category === "QUALIFIED" ||
			qualification.category === "FOLLOW_UP"
		) {
			console.log("📧 Lead is qualified/follow-up, generating email...");
			const email = await stepWriteEmail(research, qualification);
			console.log("✅ Email generated");

			await stepHumanFeedback(research, email, qualification, data);
		} else {
			console.log(
				`ℹ️  Lead category is ${qualification.category}, skipping email generation`,
			);
		}
	} catch (error) {
		console.error("❌ Workflow error:", error);
		throw error;
	}
};
