import { createApp } from 'vue';
import './style.css';
import Options from './Options.vue';
import { createPinia } from 'pinia';
import mitt from 'mitt';

import { translate } from './common/helpers';

const pinia = createPinia();
const emitter = mitt();

const app = createApp(Options).use(pinia).provide('emitter', emitter);

app.config.globalProperties.$translate = translate;

if (chrome && chrome.i18n) {
	app.mount('#app');
}
