export interface EmojiItem {
	emoji: string;
	keywords: string[];
}

export interface EmojiCategory {
	id: string;
	name: string;
	icon: string;
	emojis: EmojiItem[];
}
