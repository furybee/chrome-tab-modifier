import { createApp } from 'vue';
import SidePanel from './SidePanel.vue';
import './style.css';
import { createPinia } from 'pinia';
import mitt from 'mitt';

const pinia = createPinia();
const emitter = mitt();

createApp(SidePanel).use(pinia).provide('emitter', emitter).mount('#app');
