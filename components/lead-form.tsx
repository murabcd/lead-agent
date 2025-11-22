"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formSchema } from "@/lib/types";

export function LeadForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const idempotencyKeyRef = useRef<string | null>(null);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			phone: "",
			email: "",
			candidatesCount: "",
			company: "",
			comment: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		// Trim all string values
		const trimmedData = {
			name: data.name.trim(),
			phone: data.phone.trim(),
			email: data.email.trim(),
			candidatesCount: data.candidatesCount
				? data.candidatesCount.trim() || undefined
				: undefined,
			company: data.company?.trim() || "",
			comment: data.comment.trim(),
		};

		// Generate idempotency key if not already set
		if (!idempotencyKeyRef.current) {
			idempotencyKeyRef.current = crypto.randomUUID();
		}

		// Mark as submitting only when request actually starts
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Idempotency-Key": idempotencyKeyRef.current,
				},
				body: JSON.stringify(trimmedData),
			});

			if (response.ok) {
				toast.success("Form submitted successfully");
				form.reset({
					name: "",
					phone: "",
					email: "",
					candidatesCount: "",
					company: "",
					comment: "",
				});
				idempotencyKeyRef.current = null;
			} else {
				toast.error("Form submission failed");
			}
		} catch {
			toast.error("Form submission failed");
		} finally {
			setIsSubmitting(false);
		}
	}

	const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
		// Focus first error field
		const firstErrorField = Object.keys(errors)[0] as keyof z.infer<
			typeof formSchema
		>;
		if (firstErrorField) {
			form.setFocus(firstErrorField);
		}
	});

	return (
		<div className="flex flex-col items-center justify-center p-6">
			<Card className="w-full max-w-5xl">
				<CardContent className="p-6">
					<div className="flex justify-end mb-4">
						<Link
							href="/knowledge"
							className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
						>
							Knowledge base
						</Link>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Left side - Heading, description, and contact info */}
						<div className="flex flex-col justify-between">
							<div>
								<h2 className="text-3xl font-semibold text-foreground mb-2">
									Submit a request for
								</h2>
								<h3 className="text-3xl font-semibold text-blue-600 mb-4">
									a short demo
								</h3>
								<p className="text-sm text-muted-foreground mb-8">
									Talk to our sales team for a free consultation.
								</p>
							</div>
							{/* Contact info */}
							<div className="flex flex-col gap-2">
								<p className="text-sm text-muted-foreground mb-2">
									Contact us using:
								</p>
								<div className="flex items-center gap-3 mb-2">
									<a
										href="https://wa.me/#"
										className="flex items-center justify-center"
										aria-label="WhatsApp"
										target="_blank"
										rel="noopener noreferrer"
									>
										<span className="sr-only">WhatsApp</span>
										<Icons.whatsApp />
									</a>
									<a
										href="https://t.me/#"
										className="flex items-center justify-center"
										aria-label="Telegram"
										target="_blank"
										rel="noopener noreferrer"
									>
										<span className="sr-only">Telegram</span>
										<Icons.telegram />
									</a>
								</div>
								<p className="text-sm text-foreground font-medium">
									8 (800) 777-40-78
								</p>
								<p className="text-sm text-muted-foreground">
									Daily from 09:00 to 19:00
								</p>
							</div>
						</div>

						{/* Right side - Form fields */}
						<div>
							<form onSubmit={handleFormSubmit} className="space-y-4">
								{/* Name */}
								<Controller
									name="name"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="name">
												Name <span className="text-destructive">*</span>
											</FieldLabel>
											<Input
												{...field}
												id="name"
												aria-invalid={fieldState.invalid}
												placeholder="John Doe"
												autoComplete="name"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* Phone */}
								<Controller
									name="phone"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="phone">Phone</FieldLabel>
											<div className="flex">
												<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
													+7
												</span>
												<Input
													{...field}
													id="phone"
													type="tel"
													inputMode="tel"
													aria-invalid={fieldState.invalid}
													placeholder="(123) 456-7890"
													autoComplete="tel"
													onChange={(e) => {
														const value = e.target.value;
														if (value === "") {
															form.setValue("phone", "");
														} else {
															form.setValue(
																"phone",
																`+7${value.replace(/^\+7/, "")}`,
															);
														}
													}}
													value={
														field.value ? field.value.replace(/^\+7/, "") : ""
													}
													className="rounded-l-none"
												/>
											</div>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* Email */}
								<Controller
									name="email"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="email">
												Business Email{" "}
												<span className="text-destructive">*</span>
											</FieldLabel>
											<Input
												{...field}
												id="email"
												type="email"
												spellCheck="false"
												aria-invalid={fieldState.invalid}
												placeholder="john.doe@example.com"
												autoComplete="email"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* Number of candidates */}
								<Controller
									name="candidatesCount"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="candidatesCount">
												Number of candidates
											</FieldLabel>
											<Input
												{...field}
												id="candidatesCount"
												type="text"
												inputMode="numeric"
												aria-invalid={fieldState.invalid}
												placeholder="10"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* Company or website */}
								<Controller
									name="company"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="company">Company</FieldLabel>
											<Input
												{...field}
												id="company"
												aria-invalid={fieldState.invalid}
												placeholder="Acme Inc."
												autoComplete="organization"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* Comment */}
								<Controller
									name="comment"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="comment">
												How can we help you?{" "}
												<span className="text-destructive">*</span>
											</FieldLabel>
											<Textarea
												{...field}
												id="comment"
												aria-invalid={fieldState.invalid}
												placeholder="Enter your message…"
												rows={4}
												className="resize-none"
												onKeyDown={(e) => {
													// Cmd/Ctrl+Enter submits, Enter adds newline
													if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
														e.preventDefault();
														handleFormSubmit();
													}
												}}
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* Submit button and privacy */}
								<div className="flex items-center gap-4 mt-6">
									<Button
										type="submit"
										disabled={isSubmitting}
										className="px-8 bg-blue-600 text-white hover:bg-blue-700 shrink-0"
									>
										{isSubmitting && (
											<Loader2 className="size-4 animate-spin" />
										)}
										Submit
									</Button>
									<p className="text-xs text-muted-foreground flex-1">
										By clicking the "Submit" button, you automatically agree to
										and accept the{" "}
										<a href="/#" className="text-blue-600 hover:underline">
											terms of personal data processing
										</a>
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
