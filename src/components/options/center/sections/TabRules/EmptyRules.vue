<template>
	<div class="hero min-h-screen bg-base-200">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">Hello there</h1>
				<p class="py-6">
					There is no rule yet! Hit the following button to create your first rule.
				</p>
				<button class="btn btn-primary" @click="onGetStartedClicked">Get Started</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { GLOBAL_EVENTS } from '../../../../../common/types.ts';

const emitter = inject('emitter');

const onGetStartedClicked = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL);
};
</script>

<style scoped></style>
