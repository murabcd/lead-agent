import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		AI_GATEWAY_API_KEY: z.string().optional(),
		TELEGRAM_BOT_TOKEN: z.string().optional(),
		TELEGRAM_CHAT_ID: z
			.string()
			.regex(/^-?\d+$/, "Chat ID must be numeric")
			.optional(),
		EXA_API_KEY: z.string().min(1, "EXA_API_KEY is required"),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
	},

	client: {},

	experimental__runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
