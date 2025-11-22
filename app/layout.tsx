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
		"Lead Agent is a tool that helps you find leads and convert them into customers.",
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
