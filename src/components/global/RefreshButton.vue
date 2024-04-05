<template>
	<button @click="onRefreshClicked">
		<RefreshIcon class="!w-4 !h-4 text-accent" :class="{ 'rotate-animation': isRefreshRotating }" />
	</button>
</template>
<script setup lang="ts">
import RefreshIcon from '../icons/RefreshIcon.vue';
import { ref } from 'vue';

const isRefreshRotating = ref(false);

const emit = defineEmits(['onRefreshClick']);

const onRefreshClicked = () => {
	isRefreshRotating.value = true;

	emit('onRefreshClick');

	setTimeout(() => {
		isRefreshRotating.value = false;
	}, 1000);
};
</script>
<style scoped>
@keyframes rotate360 {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.rotate-animation {
	animation: rotate360 1s ease-in-out;
}
</style>
