<template>
	<div class="hero min-h-screen bg-base-200 relative overflow-hidden">
		<div class="absolute inset-0 opacity-10">
			<div class="pattern-background"></div>
		</div>
		<div class="hero-content text-center relative z-10">
			<div class="max-w-lg">
				<h1 class="text-5xl font-bold">Hello there</h1>
				<p class="py-6 text-lg">There is no rule yet!</p>
				<p class="pb-6 text-base opacity-80">
					Rules allow you to automatically customize tabs based on their URL. You can change titles,
					icons, pin tabs, group them, and much more when they match your criteria.
				</p>
				<button class="btn btn-primary" @click="onGetStartedClicked">Create my first Rule</button>

				<Disclaimer class="mt-8" :tips="rulesTips" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { GLOBAL_EVENTS } from '../../../../../common/types.ts';
import Disclaimer from '../../../../global/Disclaimer.vue';

const emitter: any = inject('emitter');

const onGetStartedClicked = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL);
};

const rulesTips = [
	{
		id: 1,
		icon: '💡',
		text: 'You can backup and import your rules in',
		linkText: 'Settings',
		action: 'navigate-settings',
	},
	{
		id: 2,
		icon: '🎯',
		text: 'Rules are applied in order - drag to reorder them',
	},
	{
		id: 3,
		icon: '⚡',
		text: 'Use RegEx detection for advanced URL matching',
	},
	{
		id: 4,
		icon: '🔍',
		text: 'Right-click any page to quickly rename its tab',
	},
];
</script>

<style scoped>
.pattern-background {
	width: 100%;
	height: 100%;
	background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
	background-size: 32px 32px;
}
</style>
