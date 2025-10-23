<template>
	<div class="mt-6 text-center">
		<transition name="fade" mode="out-in">
			<p :key="currentTip.id" class="text-xs text-base-content/50">
				{{ currentTip.icon }} {{ currentTip.text }}
				<a
					v-if="currentTip.linkText"
					class="link link-primary hover:link-accent"
					@click="handleClick(currentTip.action)"
				>
					{{ currentTip.linkText }}
				</a>
				{{ currentTip.textAfter }}
			</p>
		</transition>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { GLOBAL_EVENTS } from '../../common/types.ts';

export interface Tip {
	id: number;
	icon: string;
	text: string;
	linkText?: string;
	textAfter?: string;
	action?: string;
}

export interface Props {
	tips: Tip[];
	interval?: number;
}

const props = withDefaults(defineProps<Props>(), {
	interval: 8000, // 8 seconds by default
});

const emitter: any = inject('emitter');
const currentIndex = ref(0);
const currentTip = ref(props.tips[0]);
let intervalId: number | null = null;

const nextTip = () => {
	if (props.tips.length <= 1) return;

	currentIndex.value = (currentIndex.value + 1) % props.tips.length;
	currentTip.value = props.tips[currentIndex.value];
};

const handleClick = (action?: string) => {
	if (!action) return;

	if (action === 'navigate-settings') {
		emitter.emit(GLOBAL_EVENTS.NAVIGATE_TO_SETTINGS);
	}
	// Add more actions here as needed
};

onMounted(() => {
	if (props.tips.length > 1) {
		intervalId = setInterval(nextTip, props.interval);
	}
});

onUnmounted(() => {
	if (intervalId) {
		clearInterval(intervalId);
	}
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
