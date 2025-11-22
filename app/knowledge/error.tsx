"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function KnowledgeError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Knowledge page error:", error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6">
			<Card className="w-full max-w-md">
				<CardContent className="p-6 text-center">
					<h2 className="text-2xl font-semibold text-foreground mb-4">
						Failed to load knowledge base
					</h2>
					<p className="text-sm text-muted-foreground mb-6">
						{process.env.NODE_ENV === "development"
							? error.message
							: "Unable to load the knowledge base. Please try again."}
					</p>
					<div className="flex gap-4 justify-center">
						<Button onClick={reset} variant="default">
							Try again
						</Button>
						<Button asChild variant="outline">
							<Link href="/">Go home</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

