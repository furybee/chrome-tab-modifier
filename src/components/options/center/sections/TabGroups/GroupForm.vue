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
				ref="currentGroupTitleInput"
				v-model="currentGroup.title"
				class="input input-xs input-bordered w-full"
				placeholder="e.g. Google"
				required
				type="text"
				autofocus
			/>
			<div v-if="showHelp" class="label opacity-80">You can set a title for your tab</div>
		</div>

		<div class="form-control w-full flex-1">
			<div class="label">
				<span class="label-text text-sm">Color</span>
			</div>
			<div class="flex gap-2">
				<CustomSelect v-model="currentGroup.color" :items="availableGroupColors" />
			</div>
			<div v-if="showHelp" class="label">
				<span class="text-xs label-text-alt opacity-80">You can set a color for your group</span>
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

			<div class="form-control mt-4">
				<label class="cursor-pointer label">
					<span class="label-text text-sm">Merge across windows</span>
					<input
						v-model="currentGroup.merge"
						class="toggle toggle-sm toggle-primary"
						type="checkbox"
					/>
				</label>
			</div>
			<div v-if="showHelp" class="label">
				<span class="text-xs label-text-alt opacity-80">Prevent creating duplicate groups in different windows</span>
			</div>
		</div>

		<div class="modal-action items-center">
			<p v-if="showHelp" class="py-4 opacity-80">Remember refresh your tabs after saving</p>
			<form method="dialog">
				<button class="btn btn-sm">Close <kbd v-if="showHelp" class="kbd kbd-xs">esc</kbd></button>
			</form>
			<button
				:disabled="currentGroup.title.trim() === ''"
				class="btn btn-sm btn-outline btn-primary ml-4 group"
				@click="save"
			>
				Save
			</button>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import { computed, inject, onMounted, ref, watch } from 'vue';
import CustomSelect from '../../../../global/CustomSelect.vue';
import { _clone, _groupColors } from '../../../../../common/helpers.ts';
import { GLOBAL_EVENTS, Group } from '../../../../../common/types.ts';
import HelpSwap from '../../../../global/HelpSwap.vue';

const emitter: any = inject('emitter');
const rulesStore = useRulesStore();

const isEditMode = computed(() => !!rulesStore.currentGroup);

const defaultGroup: Partial<Group> = {
	title: '',
	color: 'grey',
	collapsed: false,
	merge: false,
};

const showHelp = ref(false);
const currentGroup = ref(_clone(rulesStore.currentGroup ?? defaultGroup));

const availableGroupColors = _groupColors();

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

const currentGroupTitleInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
	if (currentGroupTitleInput.value) {
		currentGroupTitleInput.value.focus();
	}
});
</script>
