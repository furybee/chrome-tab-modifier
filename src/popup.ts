import { createApp } from 'vue';
import './style.css';
import Options from './Popup.vue';
import { createPinia } from 'pinia';
import mitt from 'mitt';

const pinia = createPinia();
const emitter = mitt();

createApp(Options).use(pinia).provide('emitter', emitter).mount('#app');
