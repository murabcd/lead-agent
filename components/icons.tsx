import type { LucideIcon, LucideProps } from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
	whatsApp: ({ ...props }: LucideProps) => (
		<svg
			aria-label="WhatsApp"
			role="img"
			viewBox="0 0 512 512"
			xmlns="http://www.w3.org/2000/svg"
			className="size-8"
			{...props}
		>
			<rect width="512" height="512" rx="15%" fill="#25d366" />
			<path
				fill="#25d366"
				stroke="#ffffff"
				strokeWidth="26"
				d="M123 393l14-65a138 138 0 1150 47z"
			/>
			<path
				fill="#ffffff"
				d="M308 273c-3-2-6-3-9 1l-12 16c-3 2-5 3-9 1-15-8-36-17-54-47-1-4 1-6 3-8l9-14c2-2 1-4 0-6l-12-29c-3-8-6-7-9-7h-8c-2 0-6 1-10 5-22 22-13 53 3 73 3 4 23 40 66 59 32 14 39 12 48 10 11-1 22-10 27-19 1-3 6-16 2-18"
			/>
		</svg>
	),

	telegram: ({ ...props }: LucideProps) => (
		<svg
			aria-label="Telegram"
			role="img"
			viewBox="0 0 512 512"
			xmlns="http://www.w3.org/2000/svg"
			className="size-8"
			{...props}
		>
			<rect width="512" height="512" rx="15%" fill="#37aee2" />
			<path fill="#c8daea" d="M199 404c-11 0-10-4-13-14l-32-105 245-144" />
			<path fill="#a9c9dd" d="M199 404c7 0 11-4 16-8l45-43-56-34" />
			<path
				fill="#f6fbfe"
				d="M204 319l135 99c14 9 26 4 30-14l55-258c5-22-9-32-24-25L79 245c-21 8-21 21-4 26l83 26 190-121c9-5 17-3 11 4"
			/>
		</svg>
	),
};
