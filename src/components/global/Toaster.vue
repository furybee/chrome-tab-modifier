<template>
	<div class="toast toast-bottom toast-center">
		<div v-if="type === 'info'" class="alert alert-info">
			<span>{{ message }}</span>
		</div>
		<div v-if="type === 'success'" class="alert alert-success">
			<span>{{ message }}</span>
		</div>
		<div v-if="type === 'error'" class="alert alert-error">
			<span>{{ message }}</span>
		</div>
		<div v-if="type === 'warning'" class="alert alert-warning">
			<span>{{ message }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { GLOBAL_EVENTS, ToastParams, ToastType } from '../../common/types.ts';
import { inject, onMounted, onUnmounted, ref } from 'vue';

const emitter = inject('emitter');

const type = ref<ToastType>('none');
const message = ref('');

const showToast = (params: ToastParams) => {
	type.value = params.type;
	message.value = params.message;

	setTimeout(() => {
		type.value = 'none';
		message.value = '';
	}, params.timeout ?? 2000);
};

onMounted(() => {
	emitter.on(GLOBAL_EVENTS.SHOW_TOAST, showToast);
});

onUnmounted(() => {
	emitter.off(GLOBAL_EVENTS.SHOW_TOAST);
});
</script>

<style scoped></style>
