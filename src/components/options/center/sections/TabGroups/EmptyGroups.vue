<template>
	<div class="hero min-h-screen bg-base-200">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">
					{{ translate('empty_groups_title') }}
				</h1>
				<p class="py-6">
					{{ translate('empty_groups_subtitle') }}
				</p>
				<button class="btn btn-primary" @click="onGetStartedClicked">
					{{ translate('empty_groups_action') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { GLOBAL_EVENTS } from '../../../../../common/types.ts';
import { translate } from '../../../../../common/helpers.ts';

const emitter: any = inject('emitter');

const onGetStartedClicked = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL);
};
</script>

<style scoped></style>
