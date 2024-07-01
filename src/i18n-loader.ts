import i18n from './i18n';

export async function loadLocaleMessages(locale: string) {
	try {
		const response = await fetch(`../_locales/${locale}/messages.json`);
		if (!response.ok) {
			throw new Error(`Failed to load locale messages for ${locale}`);
		}
		const messages = await response.json();
		i18n.global.setLocaleMessage(locale, messages);
	} catch (error) {
		console.error(error);
	}
}
