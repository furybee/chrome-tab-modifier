<template>
	<div>
		<a class="group" :href="props.link" target="_blank">
			<div class="card bg-base-300 group-hover:bg-base-200 shadow-xl p-4 h-full flex items-center">
				<ExternalIcon class="size-3 self-end" />
				<div
					class="bg-gray-300 rounded-full p-1 h-[30px] w-[30px] flex items-center justify-center mb-2"
				>
					<slot name="icon"></slot>
				</div>
				{{ props.name }}
			</div>
		</a>
	</div>
</template>
<script lang="ts" setup>
import ExternalIcon from '../../../icons/ExternalIcon.vue';

const props = defineProps<{
	link: string;
	name: string;
}>();
</script>

<style lang="scss" scoped></style>
