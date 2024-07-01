import { createI18n } from 'vue-i18n';

const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: chrome.i18n.getUILanguage() || 'en',
	fallbackLocale: 'en',
	messages: {
		// Messages initialement vides, ils seront chargés dynamiquement
	},
});

export default i18n;
