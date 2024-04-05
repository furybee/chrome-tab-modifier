<template>
	<h3 class="font-bold text-lg flex justify-between">
		<span v-if="isEditMode">Edit rule</span>
		<span v-else>Add a new rule</span>

		<HelpSwap v-model="showHelp" />
	</h3>

	<div class="flex flex-wrap md:flex-nowrap gap-2 mt-2">
		<label class="form-control w-full md:max-w-xs md:flex-1">
			<div class="label">
				<span class="label-text text-sm">Name</span>
			</div>
			<input
				v-model="currentRule.name"
				class="input input-xs input-bordered w-full"
				placeholder="e.g. Pinned GMail"
				required
				type="text"
			/>
			<div v-if="showHelp" class="label">
				<span class="text-xs label-text-alt">Give an explicit name, just for you</span>
			</div>
		</label>

		<label class="form-control w-full md:max-w-xs md:flex-0">
			<div class="label">
				<span class="label-text text-sm">Detection</span>
			</div>
			<select v-model="currentRule.detection" class="select select-xs select-bordered">
				<option v-for="(detection, index) in detections" :key="index" :value="detection.value">
					{{ detection.name }}
				</option>
			</select>
		</label>

		<label class="form-control w-full md:max-w-xs md:flex-1">
			<div class="label">
				<span class="label-text text-sm">URL Fragment</span>
			</div>
			<input
				v-model="currentRule.url_fragment"
				class="input input-xs input-bordered w-full md:max-w-xs"
				placeholder="e.g mail.google.com"
				required
				type="text"
			/>
			<div v-if="showHelp" class="label">
				<span class="text-xs label-text-alt">URL fragment to find</span>
			</div>
		</label>
	</div>

	<div v-if="isFirstPartFilled" class="mt-6">
		<hr class="border-base-300" />

		<div class="flex gap-2 mt-4">
			<label class="form-control w-full max-w-xs md:flex-0">
				<div class="label">
					<span class="label-text text-sm">Group <NewFeature /></span>
				</div>

				<CustomSelect v-model="currentRule.tab.group_id" :items="availableGroups" />
			</label>

			<label class="form-control w-full md:flex-1">
				<div class="label">
					<span class="label-text text-sm">Tab title</span>
				</div>
				<input
					v-model="currentRule.tab.title"
					class="input input-xs input-bordered w-full"
					placeholder="e.g. Hey {title}"
					required
					type="text"
				/>
				<div class="label">
					<span v-if="showHelp" class="text-xs label-text-alt">
						You can inject any DOM content with {selector}. Examples: {title} for website title,
						{h1}, {#id}, {.class}, etc.
					</span>
				</div>
			</label>
		</div>

		<div class="flex gap-2">
			<label class="form-control w-full max-w-xs md:flex-0">
				<div class="label">
					<span class="label-text text-sm">Icon</span>
				</div>

				<div class="flex w-full gap-2">
					<CustomSelect v-model="currentRule.tab.icon" :items="icons" />
				</div>
			</label>

			<label class="form-control w-full md:flex-1">
				<div class="label">
					<span class="label-text text-sm">Custom Icon</span>
				</div>
				<input
					v-model="customIcon"
					class="input input-xs input-bordered w-full"
					placeholder="e.g. https://google.com/favicon.ico"
					required
					type="text"
				/>
				<div v-if="showHelp" class="label">
					<span class="text-xs label-text-alt"
						>You can set a custom URL or data URI for the new icon, no local path accepted</span
					>
				</div>
			</label>
		</div>

		<div class="grid grid-cols-2 gap-2 mt-6">
			<div class="form-control max-w-xs">
				<label class="cursor-pointer label">
					<span class="label-text text-xs">Pinned</span>
					<input
						v-model="currentRule.tab.pinned"
						:disabled="!!currentRule.tab.group_id"
						checked
						class="toggle toggle-sm toggle-primary"
						type="checkbox"
					/>
				</label>
			</div>
			<div class="form-control max-w-xs">
				<label class="cursor-pointer label">
					<span class="label-text text-xs">Ask before closing</span>
					<input
						v-model="currentRule.tab.protected"
						checked
						class="toggle toggle-sm toggle-primary"
						type="checkbox"
					/>
				</label>
			</div>
			<div class="form-control max-w-xs">
				<label class="cursor-pointer label">
					<span class="label-text text-xs">Unique</span>
					<input
						v-model="currentRule.tab.unique"
						checked
						class="toggle toggle-sm toggle-primary"
						type="checkbox"
					/>
				</label>
			</div>
			<div class="form-control max-w-xs">
				<label class="cursor-pointer label">
					<span class="label-text text-xs">Muted</span>
					<input
						v-model="currentRule.tab.muted"
						checked
						class="toggle toggle-sm toggle-primary"
						type="checkbox"
					/>
				</label>
			</div>
		</div>

		<details class="mt-6">
			<summary>Advanced</summary>
			<div class="flex gap-2">
				<label class="form-control w-full flex-1">
					<div class="label">
						<span class="label-text text-sm">Title matcher</span>
					</div>
					<input
						v-model="currentRule.tab.title_matcher"
						class="input input-xs input-bordered w-full max-w-xs"
						placeholder="Title matcher"
						required
						type="text"
					/>
					<div class="label">
						<span v-if="showHelp" class="text-xs label-text-alt">
							Regular expression to search string fragments in title</span
						>
					</div>
				</label>

				<label class="form-control w-full flex-1">
					<div class="label">
						<span class="label-text text-sm">URL matcher</span>
					</div>
					<input
						v-model="currentRule.tab.url_matcher"
						class="input input-xs input-bordered w-full max-w-xs"
						placeholder="URL matcher"
						required
						type="text"
					/>
					<div class="label">
						<span v-if="showHelp" class="text-xs label-text-alt">
							Regular expression to search string fragments in URL</span
						>
					</div>
				</label>
			</div>
		</details>
	</div>

	<div class="modal-action items-center">
		<p v-if="showHelp" class="py-4">Remember refresh your tabs after saving</p>
		<form method="dialog">
			<button class="btn btn-sm">Close <kbd v-if="showHelp" class="kbd kbd-xs">esc</kbd></button>
		</form>
		<button class="btn btn-sm btn-outline btn-primary ml-4 group" @click="save">
			Save
			<!--			<span v-if="showHelp">-->
			<!--				<kbd class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary">⌘</kbd-->
			<!--				><kbd class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary">S</kbd>-->
			<!--			</span>-->
		</button>
	</div>
</template>
<script lang="ts" setup>
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import { computed, inject, ref, watch } from 'vue';
import CustomSelect, { SelectItem } from '../../../../global/CustomSelect.vue';
import NewFeature from '../../../../global/NewFeature.vue';
import {
	_chromeGroupColor,
	_clone,
	_getDetections,
	_getIcons,
} from '../../../../../common/helpers.ts';
import { GLOBAL_EVENTS, Group } from '../../../../../common/types.ts';
import HelpSwap from '../../../../global/HelpSwap.vue';
import { _getDefaultRule } from '../../../../../common/storage.ts';

const rulesStore = useRulesStore();

const defaultRule = _getDefaultRule('', 'CONTAINS', '');

const customIcon = ref('');
const iconUrl = ref('');
const showHelp = ref(false);
const currentRule = ref(_clone(rulesStore.currentRule ?? defaultRule));

const isEditMode = computed(() => !!rulesStore.currentRule);

const isFirstPartFilled = computed(() => {
	return currentRule.value.name && currentRule.value.detection && currentRule.value.url_fragment;
});

const availableGroups = rulesStore.groups.map((group: Group) => {
	return {
		icon: null,
		color: _chromeGroupColor(group.color),
		value: group.id,
		label: group.title,
	};
}) as SelectItem[];

watch(
	() => rulesStore.currentRule,
	(newRule) => {
		currentRule.value = newRule ?? defaultRule;
	}
);

watch(
	() => customIcon.value,
	(newIcon) => {
		if (newIcon) {
			currentRule.value.tab.icon = newIcon;
		}
	}
);

watch(
	() => currentRule.value.tab.icon,
	(newIcon) => {
		if (newIcon.startsWith('http')) {
			iconUrl.value = newIcon;

			return;
		}

		iconUrl.value = chrome.runtime.getURL('/assets/' + newIcon);
		customIcon.value = '';
	}
);

watch(
	() => currentRule.value.tab.group_id,
	(newGroupId) => {
		if (newGroupId) {
			currentRule.value.tab.pinned = false;
		}
	}
);

const emitter = inject('emitter');
const save = async () => {
	if (isEditMode.value) {
		await rulesStore.updateRule(currentRule.value);
	} else {
		await rulesStore.addRule(currentRule.value);
	}

	emitter.emit(GLOBAL_EVENTS.CLOSE_ADD_RULE_MODAL);

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: 'Saved successfully!',
	});
};

const detections = _getDetections();
const icons = _getIcons();
</script>
