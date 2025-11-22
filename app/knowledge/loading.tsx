import { Card, CardContent } from "@/components/ui/card";

export default function KnowledgeLoading() {
	return (
		<div className="flex flex-col items-center justify-center p-6">
			<Card className="w-full max-w-5xl">
				<CardContent className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Left side skeleton */}
						<div className="flex flex-col justify-between">
							<div>
								<div className="h-8 bg-muted rounded w-3/4 mb-2 animate-pulse" />
								<div className="h-8 bg-muted rounded w-1/2 mb-4 animate-pulse" />
								<div className="h-4 bg-muted rounded w-full mb-2 animate-pulse" />
								<div className="h-4 bg-muted rounded w-5/6 mb-8 animate-pulse" />
							</div>
							<div className="flex flex-col gap-2">
								<div className="mb-2">
									<div className="h-4 bg-muted rounded w-32 mb-2 animate-pulse" />
									<div className="h-4 bg-muted rounded w-24 animate-pulse" />
								</div>
								<div>
									<div className="h-4 bg-muted rounded w-40 mb-2 animate-pulse" />
									<div className="h-4 bg-muted rounded w-full animate-pulse" />
								</div>
							</div>
						</div>

						{/* Right side skeleton */}
						<div>
							<div className="space-y-4">
								<div>
									<div className="h-4 bg-muted rounded w-32 mb-2 animate-pulse" />
									<div className="h-10 bg-muted rounded w-full animate-pulse" />
								</div>
								<div>
									<div className="h-4 bg-muted rounded w-28 mb-2 animate-pulse" />
									<div className="h-10 bg-muted rounded w-full animate-pulse" />
								</div>
								<div className="flex items-center gap-4 mt-6">
									<div className="h-10 bg-muted rounded w-24 animate-pulse" />
									<div className="h-10 bg-muted rounded w-20 animate-pulse" />
									<div className="h-4 bg-muted rounded flex-1 animate-pulse" />
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

