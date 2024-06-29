import { createApp } from 'vue';
import './style.css';
import Popup from './Popup.vue';
import { createPinia } from 'pinia';
import mitt from 'mitt';
import { translate } from './common/helpers';

const pinia = createPinia();
const emitter = mitt();

const app = createApp(Popup).use(pinia).provide('emitter', emitter);

app.config.globalProperties.$translate = translate;

app.mount('#app');
