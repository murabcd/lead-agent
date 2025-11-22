"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function KnowledgePage() {
	const [companyName, setCompanyName] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [currentCount, setCurrentCount] = useState<number | null>(null);

	// Load current knowledge base count
	const loadCount = useCallback(async () => {
		try {
			const response = await fetch("/api/knowledge-base/count");
			if (response.ok) {
				const data = await response.json();
				setCurrentCount(data.count);
			}
		} catch (error) {
			console.error("Failed to load count:", error);
		}
	}, []);

	// Load on mount
	useEffect(() => {
		loadCount();
	}, [loadCount]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (selectedFiles) {
			setFiles(Array.from(selectedFiles));
		}
	};

	const handleUpload = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!companyName.trim()) {
			toast.error("Please enter your company name");
			return;
		}

		if (files.length === 0) {
			toast.error("Please select at least one file");
			return;
		}

		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append("companyName", companyName.trim());
			files.forEach((file) => {
				formData.append("files", file);
			});

			const response = await fetch("/api/knowledge-base", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const data = await response.json();
				toast.success(
					`Successfully added ${data.added} entries to knowledge base`,
				);
				setCompanyName("");
				setFiles([]);
				// Reset file input
				const fileInput = document.getElementById(
					"file-input",
				) as HTMLInputElement;
				if (fileInput) {
					fileInput.value = "";
				}
				loadCount();
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to upload knowledge base");
			}
		} catch (error) {
			toast.error("Failed to upload knowledge base");
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleClear = async () => {
		if (
			!confirm(
				"Are you sure you want to clear the entire knowledge base? This cannot be undone.",
			)
		) {
			return;
		}

		try {
			const response = await fetch("/api/knowledge-base", {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Knowledge base cleared");
				loadCount();
			} else {
				toast.error("Failed to clear knowledge base");
			}
		} catch (error) {
			toast.error("Failed to clear knowledge base");
			console.error(error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center p-6">
			<Card className="w-full max-w-5xl">
				<CardContent className="p-6">
					<div className="flex justify-end mb-4">
						<Link
							href="/"
							className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
						>
							Lead agent
						</Link>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Left side - Heading, description, and info */}
						<div className="flex flex-col justify-between">
							<div>
								<h2 className="text-3xl font-semibold text-foreground mb-2">
									Upload your company
								</h2>
								<h3 className="text-3xl font-semibold text-blue-600 mb-4">
									information
								</h3>
								<p className="text-sm text-muted-foreground mb-8">
									Help the lead agent compare leads against your business.
								</p>
							</div>
							{/* Info section */}
							<div className="flex flex-col gap-2">
								{currentCount !== null && (
									<div className="mb-2">
										<p className="text-sm text-muted-foreground mb-2">
											Knowledge base:
										</p>
										<p className="text-sm text-foreground font-medium">
											{currentCount} entries indexed
										</p>
									</div>
								)}
								<div>
									<p className="text-sm text-muted-foreground mb-2">
										Supported formats:
									</p>
									<p className="text-sm text-muted-foreground">
										Text, Markdown, PDF, Word documents
									</p>
								</div>
							</div>
						</div>

						{/* Right side - Form fields */}
						<div>
							<form onSubmit={handleUpload} className="space-y-4">
								{/* Company Name */}
								<Field>
									<FieldLabel htmlFor="companyName">
										Company Name <span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										id="companyName"
										value={companyName}
										onChange={(e) => setCompanyName(e.target.value)}
										placeholder="Acme Inc."
										autoComplete="organization"
										required
									/>
									<FieldError />
								</Field>

								{/* File Upload */}
								<Field>
									<FieldLabel htmlFor="file-input">
										Upload Files <span className="text-destructive">*</span>
									</FieldLabel>
									<Input
										id="file-input"
										type="file"
										multiple
										accept=".txt,.md,.markdown,.pdf,.doc,.docx"
										onChange={handleFileChange}
										className="cursor-pointer"
										required
									/>
									<FieldError />
									{files.length > 0 && (
										<div className="mt-2">
											<p className="text-sm text-muted-foreground mb-2">
												Selected files ({files.length}):
											</p>
											<ul className="text-sm text-muted-foreground space-y-1">
												{files.map((file, index) => (
													<li
														key={`${file.name}-${index}`}
														className="flex items-center justify-between"
													>
														<span>{file.name}</span>
														<span className="text-xs">
															{(file.size / 1024).toFixed(2)} KB
														</span>
													</li>
												))}
											</ul>
										</div>
									)}
								</Field>

								{/* Upload button */}
								<div className="flex items-center gap-4 mt-6">
									<Button
										type="submit"
										disabled={isUploading}
										className="px-8 bg-blue-600 text-white hover:bg-blue-700 shrink-0"
									>
										{isUploading && <Loader2 className="size-4 animate-spin" />}
										Upload
									</Button>
									<Button
										type="button"
										variant="ghost"
										onClick={handleClear}
										disabled={isUploading || currentCount === 0}
										className="shrink-0"
									>
										Reset
									</Button>
									<p className="text-xs text-muted-foreground flex-1">
										Files will be automatically processed and indexed.
									</p>
								</div>
							</form>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
