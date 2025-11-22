"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6">
			<Card className="w-full max-w-md">
				<CardContent className="p-6 text-center">
					<h2 className="text-2xl font-semibold text-foreground mb-4">
						Something went wrong!
					</h2>
					<p className="text-sm text-muted-foreground mb-6">
						{process.env.NODE_ENV === "development"
							? error.message
							: "An unexpected error occurred. Please try again."}
					</p>
					{error.digest && (
						<p className="text-xs text-muted-foreground mb-6">
							Error ID: {error.digest}
						</p>
					)}
					<div className="flex gap-4 justify-center">
						<Button onClick={reset} variant="default">
							Try again
						</Button>
						<Button
							onClick={() => (window.location.href = "/")}
							variant="outline"
						>
							Go home
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

