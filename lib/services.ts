import {
	Experimental_Agent as Agent,
	generateObject,
	generateText,
	stepCountIs,
	tool,
} from "ai";
import { z } from "zod";
import { env } from "@/env";
import {
	getEmailPrompt,
	getEmailTranslationPrompt,
	getLanguageDetectionPrompt,
	getQualificationPrompt,
	getTranslationPrompt,
	RESEARCH_AGENT_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import { exa } from "@/lib/exa";
import { knowledgeBase } from "@/lib/knowledge-base";
import {
	type FormSchema,
	type QualificationSchema,
	qualificationSchema,
} from "@/lib/types";

export async function qualify(
	lead: FormSchema,
	research: string,
): Promise<QualificationSchema> {
	const { object } = await generateObject({
		model: "openai/gpt-5",
		schema: qualificationSchema,
		prompt: getQualificationPrompt(lead, research),
	});

	return object;
}

export async function writeEmail(
	research: string,
	qualification: QualificationSchema,
) {
	const prompt = await getEmailPrompt(research, qualification);
	const { text } = await generateText({
		model: "openai/gpt-5",
		prompt,
	});

	return text;
}

function escapeHtmlContent(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

async function detectLeadLanguage(lead: FormSchema): Promise<string> {
	const { text } = await generateText({
		model: "openai/gpt-5",
		prompt: getLanguageDetectionPrompt(lead),
	});

	const languageCode = text.trim().toLowerCase().slice(0, 2);

	if (/^[a-z]{2}$/.test(languageCode)) {
		return languageCode;
	}

	return "en";
}

async function translateMessage(
	message: string,
	targetLanguage: string,
): Promise<string> {
	if (targetLanguage === "en") {
		return message;
	}

	try {
		const { text } = await generateText({
			model: "openai/gpt-5",
			prompt: getTranslationPrompt(message, targetLanguage),
			maxRetries: 2,
		});

		return text;
	} catch (error) {
		console.error("⚠️  Translation failed, returning original message:", error);
		return message;
	}
}

export async function humanFeedback(
	research: string,
	email: string,
	qualification: QualificationSchema,
	lead?: FormSchema,
) {
	console.log("📤 Sending Telegram message for human feedback...");

	let targetLanguage = "en";
	if (lead) {
		try {
			targetLanguage = await detectLeadLanguage(lead);
			console.log(`🌍 Detected lead language: ${targetLanguage}`);
		} catch (error) {
			console.error(
				"⚠️  Error detecting language, defaulting to English:",
				error,
			);
		}
	}

	let translatedEmail = email;

	// Translate email if language is not English
	if (targetLanguage !== "en") {
		try {
			console.log(`🌐 Translating email to ${targetLanguage}...`);
			const { text } = await generateText({
				model: "openai/gpt-5",
				prompt: getEmailTranslationPrompt(email, targetLanguage),
				maxRetries: 2,
			});
			translatedEmail = text.trim();
			console.log(`✅ Email translated to ${targetLanguage}`);
		} catch (error) {
			console.error("⚠️  Error translating email, using original:", error);
		}
	}

	const message =
		`<b>📋 New Lead Qualification</b>\n\n` +
		`<b>📧 Email:</b>\n<code>${escapeHtmlContent(translatedEmail)}</code>\n\n` +
		`<b>🏷️ Category:</b> <code>${escapeHtmlContent(qualification.category)}</code>\n\n` +
		`<b>💭 Reason:</b>\n${escapeHtmlContent(qualification.reason)}\n\n` +
		`<b>🔍 Research:</b>\n${escapeHtmlContent(research)}\n\n` +
		`<i>Please review and approve or reject this email</i>`;

	let translatedMessage = message;

	// If Russian: translate entire message (email + headers + other content)
	// If NOT Russian but not English: only email is translated (already done above)
	if (targetLanguage === "ru") {
		try {
			console.log(`🌐 Translating entire message to Russian...`);
			translatedMessage = await translateMessage(message, targetLanguage);
			console.log(`✅ Entire message translated to Russian`);
		} catch (error) {
			console.error("⚠️  Error translating message, using original:", error);
		}
	}

	const telegramChatId = env.TELEGRAM_CHAT_ID;

	if (!telegramChatId) {
		console.error(
			"⚠️  TELEGRAM_CHAT_ID is not set. Cannot send message to Telegram.",
		);
		throw new Error("TELEGRAM_CHAT_ID environment variable is required");
	}

	if (!/^-?\d+$/.test(telegramChatId)) {
		console.error(
			`⚠️  Invalid TELEGRAM_CHAT_ID format: "${telegramChatId}". Chat ID must be a numeric value (e.g., "123456789" or "-1001234567890" for groups/channels).`,
		);
		throw new Error(
			"Invalid TELEGRAM_CHAT_ID format. Chat ID must be numeric.",
		);
	}

	console.log(`📱 Sending to chat ID: ${telegramChatId}`);

	try {
		const { sendTelegramMessages } = await import("@/lib/telegram");

		const messageIds = await sendTelegramMessages(
			telegramChatId,
			translatedMessage,
			{
				parseMode: "HTML",
				replyMarkup: {
					inline_keyboard: [
						[
							{
								text: "👍 Approve",
								callback_data: "lead_approved",
							},
							{
								text: "👎 Reject",
								callback_data: "lead_rejected",
							},
						],
					],
				},
			},
		);

		console.log(
			`✅ Telegram message(s) sent successfully: ${messageIds.length} message(s), IDs: ${messageIds.join(", ")}`,
		);
		return {
			messageId: messageIds[messageIds.length - 1],
			chatId: telegramChatId,
			messageCount: messageIds.length,
		};
	} catch (error) {
		console.error("❌ Error sending Telegram message:", error);
		throw error;
	}
}

export async function sendEmail() {
	// TODO: send email using provider like sendgrid, mailgun, resend etc.
}

export const fetchUrl = tool({
	description: "Return visible text from a public URL as Markdown.",
	inputSchema: z.object({
		url: z.string().describe("Absolute URL, including http:// or https://"),
	}),
	execute: async ({ url }) => {
		const result = await exa.getContents(url, {
			text: true,
		});
		return result;
	},
});

export const crmSearch = tool({
	description:
		"Search existing Vercel CRM for opportunities by company name or domain",
	inputSchema: z.object({
		name: z
			.string()
			.describe('The name of the company to search for (e.g. "Vercel")'),
	}),
	execute: async () => {
		return [];
	},
});

export const techStackAnalysis = tool({
	description: "Return tech stack analysis for a domain.",
	inputSchema: z.object({
		domain: z.string().describe('Domain, e.g. "vercel.com"'),
	}),
	execute: async () => {
		return [];
	},
});

const search = tool({
	description: "Search the web for information",
	inputSchema: z.object({
		keywords: z
			.string()
			.describe(
				'The entity to search for (e.g. "Apple") — do not include any Vercel specific keywords',
			),
		resultCategory: z
			.enum([
				"company",
				"research paper",
				"news",
				"pdf",
				"github",
				"tweet",
				"personal site",
				"linkedin profile",
				"financial report",
			])
			.describe("The category of the result you are looking for"),
	}),
	execute: async ({ keywords, resultCategory }) => {
		const result = await exa.searchAndContents(keywords, {
			numResults: 2,
			type: "keyword",
			category: resultCategory,
			summary: true,
		});
		return result;
	},
});

const queryKnowledgeBase = tool({
	description:
		"Query the company knowledge base to find information about how the lead's company, needs, or use case aligns with your company's products, services, target customers, or value proposition. Use this to understand if the lead is a good fit.",
	inputSchema: z.object({
		query: z
			.string()
			.describe(
				"The query to search for in the company knowledge base. Examples: 'What companies do we target?', 'What problems do we solve?', 'What industries do we serve?', 'What are our ideal customer profiles?'",
			),
	}),
	execute: async ({ query }) => {
		try {
			const companyName = knowledgeBase.getCompanyName();
			const totalEntries = knowledgeBase.getCount();

			console.log(
				`🔍 Querying knowledge base: "${query}" (${totalEntries} entries available)`,
			);

			if (totalEntries === 0) {
				console.warn("⚠️  Knowledge base is empty!");
				return `WARNING: The knowledge base is empty. Please upload company information first via /knowledge. Without this information, I cannot assess how well leads fit your company.`;
			}

			let results = await knowledgeBase.search(query, {
				limit: 5,
				threshold: 0.5,
			});

			if (results.length === 0) {
				console.log(
					`📊 No results with threshold 0.5, trying lower threshold 0.3...`,
				);
				results = await knowledgeBase.search(query, {
					limit: 5,
					threshold: 0.3,
				});
			}

			if (results.length === 0) {
				console.log(
					`📊 No results with semantic search, returning top entries regardless of similarity...`,
				);
				const allEntries = knowledgeBase.getAllEntries();
				results = allEntries.slice(0, 3);
			}

			console.log(
				`📊 Found ${results.length} relevant entries for query: "${query}"`,
			);

			if (results.length === 0) {
				return `No relevant information found in the ${companyName || "company"} knowledge base for this query. Try rephrasing or check if the knowledge base has relevant content.`;
			}

			const context = results
				.map((entry, index) => {
					const category = entry.category ? `[${entry.category}] ` : "";
					return `${index + 1}. ${category}${entry.content}`;
				})
				.join("\n\n");

			const companyContext = companyName
				? `Relevant information from ${companyName} knowledge base:\n\n${context}`
				: `Relevant information from company knowledge base:\n\n${context}`;

			return companyContext;
		} catch (error) {
			console.error("Error querying knowledge base:", error);
			return "Error querying the knowledge base. Please try again.";
		}
	},
});

/**
 * Research agent
 *
 * This agent is used to research the lead and return a comprehensive report
 */
export const researchAgent = new Agent({
	model: "openai/gpt-5",
	system: RESEARCH_AGENT_SYSTEM_PROMPT,
	tools: {
		search,
		queryKnowledgeBase,
		fetchUrl,
		crmSearch,
		techStackAnalysis,
	},
	stopWhen: [stepCountIs(20)],
});
