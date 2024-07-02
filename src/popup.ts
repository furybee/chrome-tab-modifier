import { createApp } from 'vue';
import './style.css';
import Popup from './Popup.vue';
import { createPinia } from 'pinia';
import mitt from 'mitt';
import i18n from './i18n';
import { loadLocaleMessages } from './i18n-loader.ts';
import { translate } from './common/helpers';
import { _getLocale } from './common/storage.ts';

const pinia = createPinia();
const emitter = mitt();

const app = createApp(Popup).use(pinia).provide('emitter', emitter);

if (chrome && chrome.i18n) {
	const locale = _getLocale();

	loadLocaleMessages(locale).then(() => {
		app.use(i18n);

		app.config.globalProperties.$translate = translate;

		app.mount('#app');
	});
}
