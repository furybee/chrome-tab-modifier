import i18n from './i18n';
import en from '../_locales/en/messages.json';
import fr from '../_locales/fr/messages.json';
import es from '../_locales/es/messages.json';
import de from '../_locales/de/messages.json';
import it from '../_locales/it/messages.json';

export const loadedLocales = new Map<string, any>();
loadedLocales.set('en', en);
loadedLocales.set('fr', fr);
loadedLocales.set('es', es);
loadedLocales.set('de', de);
loadedLocales.set('it', it);

export function loadLocaleMessages(locale: string) {
	try {
		if (!loadedLocales.has(locale)) {
			throw new Error(`Failed to load locale messages for ${locale}`);
		}

		// Default fallback
		i18n.global.setLocaleMessage('en', loadedLocales.get('en'));

		if (locale === 'en') {
			return;
		}

		i18n.global.setLocaleMessage(locale, loadedLocales.get(locale));
	} catch (error) {
		console.error(error);
	}
}
