import { cosineSimilarity, embed, embedMany } from "ai";

/**
 * Knowledge base entry structure
 */
export interface KnowledgeEntry {
	id: string;
	content: string;
	embedding: number[];
	category?: string;
	metadata?: Record<string, unknown>;
}

/**
 * In-memory knowledge base storage
 * In production, you might want to use:
 * - Upstash Vector (Redis-based)
 * - Pinecone
 * - Turbopuffer
 * - PostgreSQL with pgvector
 * - Vercel Postgres with pgvector
 */
class KnowledgeBase {
	private entries: KnowledgeEntry[] = [];
	private companyName: string = "";

	/**
	 * Add entries to the knowledge base
	 */
	async addEntries(
		contents: string[],
		categories?: string[],
		metadata?: Record<string, unknown>[],
	): Promise<void> {
		if (contents.length === 0) return;

		console.log(
			`📝 Adding ${contents.length} entries to knowledge base (current count: ${this.entries.length})`,
		);

		const { embeddings } = await embedMany({
			model: "openai/text-embedding-3-small",
			values: contents,
		});

		const newEntries: KnowledgeEntry[] = embeddings.map((embedding, index) => ({
			id: `entry-${Date.now()}-${index}`,
			content: contents[index] || "",
			embedding,
			category: categories?.[index],
			metadata: metadata?.[index],
		}));

		this.entries.push(...newEntries);
		console.log(
			`✅ Added ${newEntries.length} entries. Total entries: ${this.entries.length}`,
		);
	}

	/**
	 * Search the knowledge base for relevant content
	 */
	async search(
		query: string,
		options?: {
			limit?: number;
			threshold?: number;
			category?: string;
		},
	): Promise<KnowledgeEntry[]> {
		console.log(
			`🔍 Knowledge base search: ${this.entries.length} entries available, company: "${this.companyName}"`,
		);

		if (this.entries.length === 0) {
			console.warn("⚠️  Knowledge base is empty - no entries to search");
			return [];
		}

		const limit = options?.limit ?? 5;
		const threshold = options?.threshold ?? 0.7;

		const { embedding: queryEmbedding } = await embed({
			model: "openai/text-embedding-3-small",
			value: query,
		});

		const results = this.entries
			.filter((entry) => {
				if (options?.category && entry.category !== options.category) {
					return false;
				}
				return true;
			})
			.map((entry) => ({
				entry,
				similarity: cosineSimilarity(queryEmbedding, entry.embedding),
			}))
			.filter((result) => result.similarity >= threshold)
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, limit)
			.map((result) => result.entry);

		return results;
	}

	/**
	 * Get all entries (useful for debugging)
	 */
	getAllEntries(): KnowledgeEntry[] {
		return [...this.entries];
	}

	/**
	 * Clear all entries
	 */
	clear(): void {
		this.entries = [];
	}

	/**
	 * Get entry count
	 */
	getCount(): number {
		return this.entries.length;
	}

	/**
	 * Set company name
	 */
	setCompanyName(name: string): void {
		this.companyName = name;
	}

	/**
	 * Get company name
	 */
	getCompanyName(): string {
		return this.companyName;
	}
}

export const knowledgeBase = new KnowledgeBase();
