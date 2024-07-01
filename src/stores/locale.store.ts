import { defineStore } from 'pinia';
import { _getLocale } from '../common/storage.ts';

export const useLocaleStore = defineStore('locale', {
	state: () => {
		return {
			currentLocale: undefined as string | undefined,
		};
	},
	actions: {
		getCurrentLocale() {
			if (this.currentLocale === undefined) {
				this.currentLocale = _getLocale();
			}

			return this.currentLocale;
		},
		setCurrentLocale(locale: string) {
			this.currentLocale = locale;
		},
	},
});
