import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Lead Agent",
	description:
		"Lead qualification and research agent built with Next.js, AI SDK, Workflow DevKit, and Telegram Bot API.",
	keywords: [
		"lead qualification",
		"lead research",
		"AI agent",
		"Next.js",
		"workflow",
		"telegram bot",
		"lead generation",
	],
	authors: [{ name: "Vercel Labs" }],
	creator: "Vercel Labs",
	publisher: "Vercel Labs",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_URL || "https://lead-agent-form.vercel.app",
	),
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		title: "Lead Agent",
		description:
			"Lead qualification and research agent built with Next.js, AI SDK, Workflow DevKit, and Telegram Bot API.",
		siteName: "Lead Agent",
		images: [
			{
				url: "/api/og",
				width: 1200,
				height: 630,
				alt: "Lead Agent - Inbound lead qualification and research agent",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Lead Agent",
		description:
			"Lead qualification and research agent built with Next.js, AI SDK, Workflow DevKit, and Telegram Bot API.",
		images: ["/api/og"],
		creator: "@vercel",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<div className="flex flex-col min-h-screen">
						<div className="fixed top-4 right-4 z-50">
							<ModeToggle />
						</div>
						<div className="flex-1 flex items-center justify-center">
							{children}
						</div>
						<footer className="mt-8 flex flex-col items-center gap-4 pb-8">
							<p className="text-sm text-muted-foreground">
								Inbound lead qualification and research agent. The source code
								is available on{" "}
								<a
									href="https://github.com/vercel-labs/lead-agent"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:text-blue-700 hover:underline"
								>
									GitHub
								</a>
								.
							</p>
						</footer>
					</div>
				</ThemeProvider>
				<Toaster />
			</body>
		</html>
	);
}
