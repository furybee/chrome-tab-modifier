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

		const iconUrl = /^(https?|data):/.test(newIcon)
			? newIcon
			: chrome.runtime.getURL(`/assets/${newIcon}`);

		const newIconLink = document.createElement('link');
		newIconLink.type = 'image/x-icon';
		newIconLink.rel = 'icon';
		newIconLink.href = iconUrl;
		document.head.appendChild(newIconLink);

		return true;
	}
}
