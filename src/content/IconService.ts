/**
 * Service responsible for managing page favicons
 * Handles icon replacement and updates
 */
export class IconService {
	/**
	 * Processes and updates the page favicon
	 * @param newIcon - The new icon URL or asset name
	 * @returns true if the icon was successfully updated
	 */
	processIcon(newIcon: string): boolean {
		const icons = document.querySelectorAll('head link[rel*="icon"]');

		icons.forEach((icon) => {
			// ⚠️ icon.remove() causes issues with some websites
			// https://github.com/furybee/chrome-tab-modifier/issues/354
			// icon.remove();
			// Instead, we'll just change the rel attribute
			icon.setAttribute('rel', 'old-icon');
		});

		let iconUrl: string;

		// Check if it's an emoji (single character or emoji sequence)
		if (this.isEmoji(newIcon)) {
			iconUrl = this.emojiToDataUrl(newIcon);
		} else if (/^(https?|data):/.test(newIcon)) {
			iconUrl = newIcon;
		} else {
			iconUrl = chrome.runtime.getURL(`/assets/${newIcon}`);
		}

		const newIconLink = document.createElement('link');
		newIconLink.type = 'image/x-icon';
		newIconLink.rel = 'icon';
		newIconLink.href = iconUrl;
		document.head.appendChild(newIconLink);

		return true;
	}

	/**
	 * Check if a string is an emoji
	 */
	private isEmoji(str: string): boolean {
		// Check if it's a short string (emojis are typically 1-7 characters due to modifiers)
		if (str.length > 10) return false;

		// Regex to detect emoji characters
		const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}\p{Emoji_Modifier}\p{Emoji_Presentation}]+$/u;
		return emojiRegex.test(str);
	}

	/**
	 * Convert emoji to SVG data URL for use as favicon
	 */
	private emojiToDataUrl(emoji: string): string {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
			<text y="75" font-size="80">${emoji}</text>
		</svg>`;

		const encoded = encodeURIComponent(svg);
		return `data:image/svg+xml,${encoded}`;
	}
}
