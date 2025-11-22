import { z } from "zod";

/**
 * Lead schema
 */

export const formSchema = z.object({
	name: z
		.string()
		.min(2, "Name is required")
		.max(50, "Name must be at most 50 characters."),
	phone: z.union([
		z.literal(""),
		z
			.string()
			.regex(/^\+7[\d\s\-()]+$/, "Please enter a valid phone number.")
			.min(12, "Phone number must be at least 10 digits."),
	]),
	email: z.string().email("Please enter a valid email address."),
	candidatesCount: z
		.string()
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),
	company: z.string().optional().or(z.literal("")),
	comment: z
		.string()
		.min(1, "Comment is required")
		.max(500, "Comment must be less than 500 characters."),
});

export type FormSchema = z.infer<typeof formSchema>;

/**
 * Qualification schema
 */

export const qualificationCategorySchema = z.enum([
	"QUALIFIED",
	"UNQUALIFIED",
	"SUPPORT",
	"FOLLOW_UP",
]);

export const qualificationSchema = z.object({
	category: qualificationCategorySchema,
	reason: z.string(),
});

export type QualificationSchema = z.infer<typeof qualificationSchema>;
