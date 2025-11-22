import { env } from "@/env";
import { getResearchPrompt } from "@/lib/ai/prompts";
import {
	humanFeedback,
	qualify,
	researchAgent,
	writeEmail,
} from "@/lib/services";
import type { FormSchema, QualificationSchema } from "@/lib/types";

export const stepQualify = async (data: FormSchema, research: string) => {
	"use step";

	const qualification = await qualify(data, research);
	return qualification;
};

export const stepResearch = async (data: FormSchema) => {
	"use step";

	const { text: research } = await researchAgent.generate({
		prompt: getResearchPrompt(data),
	});

	return research;
};

export const stepWriteEmail = async (
	research: string,
	qualification: QualificationSchema,
) => {
	"use step";

	const email = await writeEmail(research, qualification);
	return email;
};

export const stepHumanFeedback = async (
	research: string,
	email: string,
	qualification: QualificationSchema,
	lead: FormSchema,
) => {
	"use step";

	console.log("🔄 Starting human feedback step...");

	if (!env.TELEGRAM_BOT_TOKEN) {
		console.warn(
			"⚠️  TELEGRAM_BOT_TOKEN is not set, skipping human feedback step",
		);
		return;
	}

	if (!env.TELEGRAM_CHAT_ID) {
		console.warn(
			"⚠️  TELEGRAM_CHAT_ID is not set, skipping human feedback step",
		);
		return;
	}

	try {
		const telegramMessage = await humanFeedback(
			research,
			email,
			qualification,
			lead,
		);
		console.log("✅ Human feedback step completed:", telegramMessage);
		return telegramMessage;
	} catch (error) {
		console.error("❌ Error in human feedback step:", error);
		throw error;
	}
};
