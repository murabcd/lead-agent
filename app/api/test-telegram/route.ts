import { NextResponse } from "next/server";
import { env } from "@/env";
import { telegramBot } from "@/lib/telegram";

export async function GET() {
	if (!telegramBot) {
		return NextResponse.json(
			{ error: "Telegram bot is not initialized" },
			{ status: 503 },
		);
	}

	const chatId = env.TELEGRAM_CHAT_ID;

	if (!chatId) {
		return NextResponse.json(
			{ error: "TELEGRAM_CHAT_ID is not set" },
			{ status: 400 },
		);
	}

	try {
		const numericChatId = parseInt(chatId, 10);

		if (Number.isNaN(numericChatId)) {
			return NextResponse.json(
				{ error: `Invalid chat ID format: "${chatId}"` },
				{ status: 400 },
			);
		}

		const result = await telegramBot.sendMessage(
			numericChatId,
			"🧪 Test message from Lead Agent bot. If you see this, the bot is working correctly!",
			{
				parse_mode: "Markdown",
			},
		);

		return NextResponse.json({
			success: true,
			message: "Test message sent successfully",
			messageId: result.message_id,
			chatId: result.chat.id,
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorCode = (error as { code?: string })?.code;
		const errorResponse = (error as { response?: { body?: unknown } })?.response
			?.body;

		console.error("Test message error:", error);

		return NextResponse.json(
			{
				error: "Failed to send test message",
				details: errorMessage,
				code: errorCode,
				response: errorResponse,
			},
			{ status: 500 },
		);
	}
}
