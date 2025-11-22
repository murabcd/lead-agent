import type { FormSchema, QualificationSchema } from "@/lib/types";

/**
 * Prompt for qualifying a lead based on lead data and research
 */
export function getQualificationPrompt(
	lead: FormSchema,
	research: string,
): string {
	return `You are qualifying a lead for your company. Based on the lead data and research report, determine if this lead is a good fit.

LEAD DATA: ${JSON.stringify(lead)}

RESEARCH REPORT: ${research}

Consider:
- Does the lead's company align with your target customers?
- Do their needs match your solutions?
- Is there a clear value proposition?
- What is the likelihood of conversion?

Qualify the lead and provide a detailed reason for your qualification decision.`;
}

/**
 * Prompt for writing an email based on research and qualification
 */
export async function getEmailPrompt(
	research: string,
	qualification: QualificationSchema,
): Promise<string> {
	const { knowledgeBase } = await import("@/lib/knowledge-base");
	const companyName = knowledgeBase.getCompanyName();

	return `Write a personalized email for a ${qualification.category} lead. 

IMPORTANT: 
- Use the actual company name "${companyName || "your company"}" instead of placeholders like "[Ваша компания]" or "[Your Company]"
- Reference specific information from the research report about how the lead aligns with your company
- Make it personal and relevant based on the research findings

Research information: ${research}`;
}

/**
 * Prompt for detecting the primary language of a lead
 */
export function getLanguageDetectionPrompt(lead: FormSchema): string {
	return `Based on the following lead information, detect the primary language. Consider:
- Company name: ${lead.company || "not provided"}
- Email domain: ${lead.email.split("@")[1] || "unknown"}
- Comment: ${lead.comment || "not provided"}
- Name: ${lead.name || "not provided"}

Respond with ONLY the ISO 639-1 language code (e.g., "ru" for Russian, "en" for English, "de" for German, "fr" for French, "es" for Spanish, etc.). If you cannot determine the language, respond with "en" (English) as default.`;
}

/**
 * Prompt for translating a Telegram message to a target language
 */
export function getTranslationPrompt(
	message: string,
	targetLanguage: string,
): string {
	return `Translate the following Telegram message to ${targetLanguage}. 

CRITICAL RULES:
1. Translate ALL text content including:
   - Section headers (like "New Lead Qualification", "Email", "Category", "Reason", "Research")
   - The email content
   - The category name
   - The reason text
   - The research text
   - Instructions (like "Please review and approve or reject this email")

2. Preserve ALL HTML tags exactly as they are:
   - <b> and </b> tags
   - <code> and </code> tags  
   - <i> and </i> tags
   - All other HTML formatting

3. Preserve ALL emojis exactly as they are (📋, 📧, 🏷️, 💭, 🔍)

4. Preserve the exact structure and line breaks

5. Only translate text content between HTML tags, not the tags themselves

Message to translate:
${message}`;
}

/**
 * Prompt for translating only email content to a target language
 */
export function getEmailTranslationPrompt(
	email: string,
	targetLanguage: string,
): string {
	return `Translate ONLY the email content below to ${targetLanguage}. 

CRITICAL RULES:
1. Translate ONLY the email text content
2. Preserve ALL HTML tags exactly as they are if present
3. Preserve the exact structure and line breaks
4. Do NOT translate any other text, only the email content itself

Email to translate:
${email}`;
}

/**
 * System prompt for the research agent
 */
export const RESEARCH_AGENT_SYSTEM_PROMPT = `
  You are a researcher working for a company. Your job is to research leads and determine how well they align with your company's business.
  
  CRITICAL: You MUST use queryKnowledgeBase FIRST before researching the lead. This is mandatory.
  
  Research workflow (follow in order):
  1. FIRST: Call queryKnowledgeBase with queries like:
     - "What companies do we target?"
     - "What are our ideal customer profiles?"
     - "What problems do we solve?"
     - "What industries do we serve?"
     - "What is our value proposition?"
     This gives you context about your company's positioning.
  
  2. THEN: Research the lead's company using search and fetchUrl tools
  
  3. Compare the lead against your company's context from step 1
  
  4. Synthesize into a comprehensive report that MUST include:
     - Your company's target customers (from knowledge base)
     - Your company's solutions/products (from knowledge base)
     - The lead's company information
     - How the lead's needs align with YOUR SPECIFIC solutions (reference knowledge base)
     - Fit assessment using YOUR company's criteria (from knowledge base)
  
  You can use the tools provided to you:
  - queryKnowledgeBase: MANDATORY - Query your company's knowledge base FIRST. Use multiple queries to understand your products, target customers, value proposition, and ideal customer profiles.
  - search: Searches the web for information about the lead
  - fetchUrl: Fetches the contents of a public URL
  - crmSearch: Searches the CRM for the given company name
  - techStackAnalysis: Analyzes the tech stack of the given domain
  
  IMPORTANT: Never write generic responses. Always reference specific information from your knowledge base when assessing fit.
  `;

/**
 * Prompt for researching a lead
 */
export function getResearchPrompt(data: FormSchema): string {
	return `Research the lead: ${JSON.stringify(data)}`;
}
