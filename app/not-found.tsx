import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
	title: "404 - Page Not Found | Lead Agent",
	description: "The page you are looking for does not exist.",
};

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6">
			<Card className="w-full max-w-md">
				<CardContent className="p-6 text-center">
					<h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
					<h2 className="text-2xl font-semibold text-foreground mb-2">
						Page Not Found
					</h2>
					<p className="text-sm text-muted-foreground mb-6">
						The page you are looking for does not exist or has been moved.
					</p>
					<div className="flex gap-4 justify-center">
						<Button asChild variant="default">
							<Link href="/">Go home</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/knowledge">Knowledge Base</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

