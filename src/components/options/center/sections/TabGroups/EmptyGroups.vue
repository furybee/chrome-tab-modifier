<template>
	<div class="hero min-h-screen bg-base-200 relative overflow-hidden">
		<div class="absolute inset-0 opacity-10">
			<div class="pattern-background"></div>
		</div>
		<div class="hero-content text-center relative z-10">
			<div class="max-w-lg">
				<h1 class="text-5xl font-bold">Hello there</h1>
				<p class="py-6 text-lg">There is no group yet!</p>
				<p class="pb-6 text-base opacity-80">
					Groups allow you to organize your tabs visually in your browser. Create a group and then
					assign it to a rule to automatically group matching tabs together.
				</p>
				<button class="btn btn-primary" @click="onGetStartedClicked">Create my first Group</button>

				<Disclaimer class="mt-8" :tips="groupsTips" />
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
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL);
};

const groupsTips = [
	{
		id: 1,
		icon: '💡',
		text: 'You can backup and import your groups in',
		linkText: 'Settings',
		action: 'navigate-settings',
	},
	{
		id: 2,
		icon: '🎨',
		text: 'Groups help visually organize tabs in your browser',
	},
	{
		id: 3,
		icon: '🔗',
		text: 'Assign groups to rules to automatically organize matching tabs',
	},
	{
		id: 4,
		icon: '📌',
		text: 'Pinned tabs cannot be grouped - unpin them first',
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
