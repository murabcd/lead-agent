import { NextResponse } from "next/server";
import { knowledgeBase } from "@/lib/knowledge-base";

/**
 * Extract text from a file based on its type
 */
async function extractTextFromFile(file: File): Promise<string> {
	const extension = file.name.split(".").pop()?.toLowerCase() || "";
	const text = await file.text();

	switch (extension) {
		case "txt":
		case "md":
		case "markdown":
			return text;
		case "pdf":
			// TODO: Add PDF parsing library (e.g., pdf-parse)
			// For now, return a placeholder message
			throw new Error(
				"PDF parsing not yet implemented. Please convert to text file first.",
			);
		case "doc":
		case "docx":
			// TODO: Add Word document parsing library (e.g., mammoth for docx)
			// For now, return a placeholder message
			throw new Error(
				"Word document parsing not yet implemented. Please convert to text or markdown file first.",
			);
		default:
			return text; // Try to read as text anyway
	}
}

/**
 * Split text into chunks for better semantic search
 */
function chunkText(text: string, maxChunkSize: number = 1000): string[] {
	const paragraphs = text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	const chunks: string[] = [];
	let currentChunk = "";

	for (const paragraph of paragraphs) {
		if (
			currentChunk.length > 0 &&
			currentChunk.length + paragraph.length + 2 > maxChunkSize
		) {
			chunks.push(currentChunk.trim());
			currentChunk = "";
		}

		if (paragraph.length > maxChunkSize) {
			const sentences = paragraph.split(/[.!?]+\s+/);
			for (const sentence of sentences) {
				if (
					currentChunk.length > 0 &&
					currentChunk.length + sentence.length + 2 > maxChunkSize
				) {
					chunks.push(currentChunk.trim());
					currentChunk = "";
				}
				currentChunk += (currentChunk ? " " : "") + sentence.trim();
			}
		} else {
			currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
		}
	}

	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks.length > 0 ? chunks : [text];
}

/**
 * POST /api/knowledge-base
 * Upload files and add entries to the knowledge base
 */
export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const companyName = formData.get("companyName")?.toString();

		if (!companyName || !companyName.trim()) {
			return NextResponse.json(
				{ error: "Company name is required" },
				{ status: 400 },
			);
		}

		const files = formData.getAll("files") as File[];
		if (files.length === 0) {
			return NextResponse.json(
				{ error: "At least one file is required" },
				{ status: 400 },
			);
		}

		const contents: string[] = [];
		const categories: string[] = [];
		const metadata: Record<string, unknown>[] = [];

		for (const file of files) {
			try {
				const fileText = await extractTextFromFile(file);
				const chunks = chunkText(fileText);

				for (const chunk of chunks) {
					if (chunk.trim().length > 0) {
						contents.push(chunk.trim());
						categories.push("uploaded-file");
						metadata.push({
							companyName: companyName.trim(),
							fileName: file.name,
							fileType: file.type || "unknown",
							fileSize: file.size,
						});
					}
				}
			} catch (error) {
				console.error(`Error processing file ${file.name}:`, error);
				if (error instanceof Error) {
					return NextResponse.json(
						{ error: `Error processing ${file.name}: ${error.message}` },
						{ status: 400 },
					);
				}
			}
		}

		if (contents.length === 0) {
			return NextResponse.json(
				{ error: "No valid content extracted from files" },
				{ status: 400 },
			);
		}

		console.log(
			`📤 Adding ${contents.length} entries to knowledge base for company: ${companyName.trim()}`,
		);
		await knowledgeBase.addEntries(contents, categories, metadata);

		knowledgeBase.setCompanyName(companyName.trim());

		const finalCount = knowledgeBase.getCount();
		console.log(
			`✅ Knowledge base updated: ${finalCount} total entries, company: "${knowledgeBase.getCompanyName()}"`,
		);

		return NextResponse.json({
			success: true,
			added: contents.length,
			total: finalCount,
			filesProcessed: files.length,
		});
	} catch (error) {
		console.error("Error adding to knowledge base:", error);
		return NextResponse.json(
			{ error: "Failed to process files and add to knowledge base" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/knowledge-base
 * Clear all entries from the knowledge base
 */
export async function DELETE() {
	try {
		knowledgeBase.clear();
		knowledgeBase.setCompanyName("");
		return NextResponse.json({
			success: true,
			message: "Knowledge base cleared",
		});
	} catch (error) {
		console.error("Error clearing knowledge base:", error);
		return NextResponse.json(
			{ error: "Failed to clear knowledge base" },
			{ status: 500 },
		);
	}
}
