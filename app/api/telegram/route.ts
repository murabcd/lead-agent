import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/services";
import { telegramBot } from "@/lib/telegram";

if (telegramBot) {
	const bot = telegramBot;

	bot.on("callback_query", async (query) => {
		const chatId = query.message?.chat.id;
		const messageId = query.message?.message_id;
		const data = query.data;

		if (!chatId || !messageId || !data) {
			return;
		}

		try {
			await bot.answerCallbackQuery(query.id);

			if (data === "lead_approved") {
				const approvedText = `✅ <b>Approved</b>\n\n${query.message?.text || ""}`;
				await bot.editMessageText(approvedText, {
					chat_id: chatId,
					message_id: messageId,
					parse_mode: "HTML",
				});

				// In production, grab email from database or storage
				await sendEmail();
			} else if (data === "lead_rejected") {
				const rejectedText = `❌ <b>Rejected</b>\n\n${query.message?.text || ""}`;
				await bot.editMessageText(rejectedText, {
					chat_id: chatId,
					message_id: messageId,
					parse_mode: "HTML",
				});
			}
		} catch (error) {
			console.error("Error handling callback query:", error);
			await bot.sendMessage(
				chatId,
				"An error occurred while processing your request.",
			);
		}
	});

	bot.on("message", async (msg) => {
		const chatId = msg.chat.id;
		const text = msg.text;

		if (text === "/start") {
			await bot.sendMessage(
				chatId,
				"Hello! I am your lead agent bot. I will notify you when new leads need approval.",
			);
		}
	});
}

export async function POST(request: NextRequest) {
	if (!telegramBot) {
		return NextResponse.json(
			{ error: "Telegram credentials not configured" },
			{ status: 503 },
		);
	}

	try {
		const body = await request.json();
		await telegramBot.processUpdate(body);

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Error processing Telegram update:", error);
		return NextResponse.json(
			{ error: "Error processing update" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	if (!telegramBot) {
		return NextResponse.json(
			{ error: "Telegram credentials not configured" },
			{ status: 503 },
		);
	}

	const searchParams = request.nextUrl.searchParams;
	const action = searchParams.get("action");

	if (action === "set-webhook") {
		const webhookUrl = searchParams.get("url");
		if (!webhookUrl) {
			return NextResponse.json(
				{ error: "URL parameter required" },
				{ status: 400 },
			);
		}

		try {
			await telegramBot.setWebHook(webhookUrl);
			return NextResponse.json({
				ok: true,
				message: "Webhook set successfully",
			});
		} catch (error) {
			console.error("Error setting webhook:", error);
			return NextResponse.json(
				{ error: "Error setting webhook" },
				{ status: 500 },
			);
		}
	}

	return NextResponse.json({ message: "Telegram webhook endpoint" });
}
