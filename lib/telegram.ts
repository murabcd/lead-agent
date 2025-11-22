import TelegramBot from "node-telegram-bot-api";
import { env } from "@/env";

const hasTelegramCredentials = !!env.TELEGRAM_BOT_TOKEN;

if (!hasTelegramCredentials) {
	console.warn(
		"⚠️  TELEGRAM_BOT_TOKEN is not set. Telegram integration will be disabled.",
	);
}

export const telegramBot =
	hasTelegramCredentials && env.TELEGRAM_BOT_TOKEN
		? new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
				polling: false,
			})
		: null;

export async function sendTelegramMessageWithButtons(
	chatId: string,
	text: string,
): Promise<{ messageId: number; chatId: string }> {
	if (!telegramBot) {
		throw new Error(
			"Telegram bot is not initialized. Please set TELEGRAM_BOT_TOKEN environment variable.",
		);
	}

	const numericChatId = parseInt(chatId, 10);

	if (Number.isNaN(numericChatId)) {
		throw new Error(
			`Invalid chat ID format: "${chatId}". Must be a numeric string.`,
		);
	}

	console.log(`📨 Attempting to send message to chat ID: ${numericChatId}`);

	try {
		const result = await telegramBot.sendMessage(numericChatId, text, {
			parse_mode: "HTML",
			reply_markup: {
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
		});

		console.log("✅ Message sent successfully. Message ID:", result.message_id);

		return {
			messageId: result.message_id,
			chatId: result.chat.id.toString(),
		};
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorCode = (error as { code?: string })?.code;
		const errorResponse = (error as { response?: { body?: unknown } })?.response
			?.body;

		console.error("❌ Telegram API error:", {
			code: errorCode,
			response: errorResponse,
			message: errorMessage,
		});
		throw error;
	}
}

export async function editTelegramMessage(
	chatId: string,
	messageId: number,
	text: string,
): Promise<void> {
	if (!telegramBot) {
		throw new Error(
			"Telegram bot is not initialized. Please set TELEGRAM_BOT_TOKEN environment variable.",
		);
	}

	await telegramBot.editMessageText(text, {
		chat_id: chatId,
		message_id: messageId,
		parse_mode: "HTML",
	});
}

export async function sendTelegramMessage(
	chatId: string,
	text: string,
): Promise<void> {
	if (!telegramBot) {
		throw new Error(
			"Telegram bot is not initialized. Please set TELEGRAM_BOT_TOKEN environment variable.",
		);
	}

	await telegramBot.sendMessage(chatId, text, {
		parse_mode: "HTML",
	});
}

/**
 * Split a long message into chunks that fit within Telegram's 4096 character limit
 */
function splitMessage(text: string, maxLength: number = 4000): string[] {
	if (text.length <= maxLength) {
		return [text];
	}

	const chunks: string[] = [];
	let currentChunk = "";
	const lines = text.split("\n");

	for (const line of lines) {
		if (
			currentChunk.length > 0 &&
			currentChunk.length + line.length + 1 > maxLength
		) {
			chunks.push(currentChunk.trim());
			currentChunk = "";
		}

		if (line.length > maxLength) {
			if (currentChunk.length > 0) {
				chunks.push(currentChunk.trim());
				currentChunk = "";
			}
			const words = line.split(" ");
			for (const word of words) {
				if (
					currentChunk.length > 0 &&
					currentChunk.length + word.length + 1 > maxLength
				) {
					chunks.push(currentChunk.trim());
					currentChunk = "";
				}
				currentChunk += (currentChunk ? " " : "") + word;
			}
		} else {
			currentChunk += (currentChunk ? "\n" : "") + line;
		}
	}

	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

/**
 * Send multiple Telegram messages, splitting if needed
 */
export async function sendTelegramMessages(
	chatId: string,
	text: string,
	options?: {
		parseMode?: "HTML" | "Markdown";
		replyMarkup?: TelegramBot.InlineKeyboardMarkup;
	},
): Promise<number[]> {
	if (!telegramBot) {
		throw new Error(
			"Telegram bot is not initialized. Please set TELEGRAM_BOT_TOKEN environment variable.",
		);
	}

	const chunks = splitMessage(text);
	const messageIds: number[] = [];

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const isLast = i === chunks.length - 1;

		const replyMarkup =
			isLast && options?.replyMarkup ? options.replyMarkup : undefined;

		const messageText = isLast
			? chunk
			: `${chunk}\n\n<i>(Message ${i + 1} of ${chunks.length})</i>`;

		const result = await telegramBot.sendMessage(chatId, messageText, {
			parse_mode: options?.parseMode || "HTML",
			reply_markup: replyMarkup,
		});

		messageIds.push(result.message_id);
	}

	return messageIds;
}
