<template>
	<h3 class="font-bold text-lg flex justify-between">
		<span v-if="isEditMode">Edit group</span>
		<span v-else>Add a new group</span>

		<HelpSwap v-model="showHelp" />
	</h3>

	<div class="flex flex-col gap-2 mt-2">
		<div class="form-control w-full flex-1">
			<label class="label">
				<span class="label-text text-sm">Title</span>
			</label>
			<input
				v-model="currentGroup.title"
				class="input input-xs input-bordered w-full"
				placeholder="e.g. Google"
				required
				type="text"
			/>
			<div v-if="showHelp" class="label">You can set a title for your tab</div>
		</div>

		<div class="form-control w-full flex-1">
			<div class="label">
				<span class="label-text text-sm">Color</span>
			</div>
			<div class="flex gap-2">
				<CustomSelect v-model="currentGroup.color" :items="availableGroupColors" />
			</div>
			<div v-if="showHelp" class="label">
				<span class="text-xs label-text-alt">You can set a color for your group</span>
			</div>

			<div class="form-control mt-4">
				<label class="cursor-pointer label">
					<span class="label-text text-sm">Collapsed</span>
					<input
						v-model="currentGroup.collapsed"
						checked
						class="toggle toggle-sm toggle-primary"
						type="checkbox"
					/>
				</label>
			</div>
		</div>

		<div class="modal-action items-center">
			<p v-if="showHelp" class="py-4">Remember refresh your tabs after saving</p>
			<form method="dialog">
				<button class="btn btn-sm">Close <kbd v-if="showHelp" class="kbd kbd-xs">esc</kbd></button>
			</form>
			<button class="btn btn-sm btn-outline btn-primary ml-4 group" @click="save">
				Save
				<!--				<span v-if="showHelp">-->
				<!--					<kbd class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary">⌘</kbd-->
				<!--					><kbd class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary">S</kbd>-->
				<!--				</span>-->
			</button>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import { computed, inject, ref, watch } from 'vue';
import CustomSelect from '../../../../global/CustomSelect.vue';
import { _chromeGroupColor, _clone } from '../../../../../common/helpers.ts';
import { GLOBAL_EVENTS } from '../../../../../common/types.ts';
import HelpSwap from '../../../../global/HelpSwap.vue';

const emitter = inject('emitter');
const rulesStore = useRulesStore();

const isEditMode = computed(() => !!rulesStore.currentGroup);

const defaultGroup = {
	title: '',
	color: 'grey',
	collapsed: false,
};

const showHelp = ref(false);
const currentGroup = ref(_clone(rulesStore.currentGroup ?? defaultGroup));

const availableGroupColors = [
	{ label: 'grey', value: 'grey', color: _chromeGroupColor('grey') },
	{ label: 'blue', value: 'blue', color: _chromeGroupColor('blue') },
	{ label: 'red', value: 'red', color: _chromeGroupColor('red') },
	{ label: 'yellow', value: 'yellow', color: _chromeGroupColor('yellow') },
	{ label: 'green', value: 'green', color: _chromeGroupColor('green') },
	{ label: 'pink', value: 'pink', color: _chromeGroupColor('pink') },
	{ label: 'purple', value: 'purple', color: _chromeGroupColor('purple') },
	{ label: 'cyan', value: 'cyan', color: _chromeGroupColor('cyan') },
	{ label: 'orange', value: 'orange', color: _chromeGroupColor('orange') },
];

watch(
	() => rulesStore.currentGroup,
	(newGroup) => {
		currentGroup.value = newGroup ?? defaultGroup;
	}
);

const save = async () => {
	if (isEditMode.value) {
		await rulesStore.updateGroup(currentGroup.value);
	} else {
		await rulesStore.addGroup(currentGroup.value);
	}

	emitter.emit(GLOBAL_EVENTS.CLOSE_ADD_GROUP_MODAL);

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: 'Saved successfully!',
	});
};
</script>
