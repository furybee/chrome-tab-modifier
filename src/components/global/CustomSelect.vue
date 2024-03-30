<template>
	<div class="flex w-full bg-base-200 rounded-md">
		<div class="dropdown w-full">
			<div
				class="btn btn-xs w-full flex flex-row justify-between items-center"
				role="button"
				tabindex="0"
			>
				<div class="flex items-center">
					<img v-if="currentItem?.icon" :src="currentItem.icon" alt="_icon" class="w-4 h-4 mr-2" />
					<ColorVisualizer
						v-if="currentItem?.color"
						:color="currentItem.color"
						alt="_color"
						class="!w-4 !h-4 mr-2"
					/>

					{{ currentItem?.label ?? '' }}
				</div>
				<span v-if="props.items.length === 0">-- no items --</span>
				<ChevronDownIcon class="!w-4 !h-4 ml-2" />
			</div>
			<ul
				v-show="props.items.length > 0"
				class="w-full p-0 shadow menu dropdown-content z-[1] bg-base-300 rounded-md max-h-36 overflow-x-hidden overflow-y-auto flex flex-row"
				tabindex="0"
			>
				<li
					v-for="(item, index) in props.items"
					:key="index"
					class="w-full text-xs"
					@click="onItemSelected(item)"
				>
					<a>
						<img v-if="item.icon" :src="item.icon" alt="_icon" class="w-6 h-6 mr-2" />
						<ColorVisualizer v-if="item.color" :color="item.color" class="mr-2" />
						{{ item.label }}
					</a>
				</li>
			</ul>
		</div>
		<div class="px-1 btn btn-xs btn-accent rounded-l-none" @click="clearValue">
			<CloseIcon class="!w-4 !h-4" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import ChevronDownIcon from '../../icons/ChevronDownIcon.vue';
import ColorVisualizer from '../options/center/sections/TabGroups/ColorVisualizer.vue';
import CloseIcon from '../../icons/CloseIcon.vue';

interface SelectItem {
	icon?: string;
	color?: string;
	value: string;
	label: string;
}

const model = defineModel();
const icon = ref('');

const props = defineProps<{
	items: SelectItem[];
}>();

const onItemSelected = (item: SelectItem) => {
	icon.value = item.icon ?? '';
	model.value = item.value;
};

const clearValue = () => {
	icon.value = '';
	model.value = '';
};

const currentItem = computed(() => {
	return props.items.find((item) => item.value === model.value);
});
</script>

<style scoped></style>
