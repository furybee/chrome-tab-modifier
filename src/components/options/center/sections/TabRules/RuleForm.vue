<template>
	<h3 v-if="options.showTitle" class="font-bold text-lg flex justify-between mb-2">
		<span v-if="isEditMode">Edit rule</span>
		<span v-else>Add a new rule</span>

		<div class="flex gap-2 items-center">
			<HelpSwap v-model="showHelp" />
			<button
				v-if="options.showOptionLink"
				class="btn btn-xs btn-circle bg-transparent border-none hover:text-accent"
				@click="openOptions"
			>
				<SettingsIcon class="!w-4 !h-4" />
			</button>
		</div>
	</h3>

	<div class="flex flex-wrap md:flex-nowrap gap-2">
		<div class="form-control w-full md:max-w-xs md:flex-1">
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
				<span class="text-xs opacity-80 label-text-alt">Give an explicit name, just for you</span>
			</div>
		</div>

		<div class="form-control w-full md:max-w-xs md:flex-0">
			<div class="label">
				<span class="label-text text-sm">Detection</span>
			</div>
			<select v-model="currentRule.detection" class="select select-xs select-bordered">
				<option v-for="(detection, index) in detections" :key="index" :value="detection.value">
					{{ detection.name }}
				</option>
			</select>
		</div>

		<div class="form-control w-full md:max-w-xs md:flex-1">
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
				<span class="text-xs opacity-80 label-text-alt">URL fragment to find</span>
			</div>
		</div>
	</div>

	<div v-if="isFirstPartFilled" class="mt-6">
		<hr class="border-base-300" />

		<div class="flex flex-wrap md:flex-nowrap gap-2 mt-4">
			<div v-if="!isGroupFormVisible" class="form-control w-full md:max-w-xs md:flex-0">
				<div class="label">
					<span class="label-text text-sm">Group <NewFeature /></span>
				</div>

				<CustomSelect v-model="currentRule.tab.group_id" :items="availableGroups" />

				<button class="btn-link mt-1" @click.prevent="(event) => showGroupForm(event)">
					Create new group
				</button>
			</div>
			<div v-else class="bg-base-300 rounded-md w-full md:max-w-xs md:flex-0 px-2 pb-2">
				<div class="flex justify-between items-center">
					<div class="label">
						<span class="label-text text-sm">Group <NewFeature /></span>
					</div>
					<CloseIcon class="cursor-pointer hover:text-error !h-4 !w-4" @click="hideGroupForm" />
				</div>

				<ShortGroupForm v-if="newGroup" v-model="newGroup" @on-close="hideGroupForm" />
			</div>

			<div
				v-show="!isCustomIconFormVisible"
				class="form-control w-full md:w-40 md:max-w-xs md:flex-0"
			>
				<div class="label">
					<span class="label-text text-sm">Icon</span>
				</div>

				<CustomSelect v-model="currentRule.tab.icon" :items="icons" :show-label="false" />

				<button class="btn-link mt-1" @click.prevent="(event) => showCustomIconForm(event)">
					Use custom icon
				</button>
			</div>
			<div
				v-show="isCustomIconFormVisible"
				class="bg-base-300 rounded-md w-full md:max-w-xs md:flex-0 px-2 pb-2"
			>
				<div class="flex justify-between items-center">
					<div class="label">
						<span class="label-text text-sm">Custom Icon</span>
					</div>
					<CloseIcon
						class="cursor-pointer hover:text-error !h-4 !w-4"
						@click="hideCustomIconForm"
					/>
				</div>

				<div class="flex items-center justify-between gap-2">
					<img v-if="isCustomIcon" :src="currentRule.tab.icon" class="w-6 h-6" />
					<input
						v-model="currentRule.tab.icon"
						class="input input-xs input-bordered w-full"
						:class="{
							'input-error':
								!isCustomIcon && currentRule.tab.icon !== '' && currentRule.tab.icon !== null,
						}"
						placeholder="e.g. https://google.com/favicon.ico"
						required
						type="text"
					/>
				</div>
				<div v-if="showHelp" class="label">
					<span class="text-xs opacity-80 label-text-alt"
						>You can set a custom URL or data URI for the new icon, no local path accepted</span
					>
				</div>
			</div>

			<div class="form-control w-full md:flex-1">
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
					<span v-if="showHelp" class="text-xs opacity-80 label-text-alt">
						You can inject any DOM content with {selector}. Examples: {title} for website title,
						{h1}, {#id}, {.class}, etc.
					</span>
				</div>
			</div>
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

		<details class="mt-6" :open="isAdvancedOpenWhenMounted">
			<summary class="mb-3 cursor-pointer">Advanced</summary>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
				<label class="form-control w-full flex-1">
					<div class="label">
						<span class="label-text text-sm">Title matcher</span>
					</div>
					<input
						v-model="currentRule.tab.title_matcher"
						class="input input-xs input-bordered w-full"
						placeholder="Title matcher"
						required
						type="text"
					/>
					<div v-if="showHelp">
						<div class="label">
							<span class="text-xs opacity-80 label-text-alt">
								Regular expression to search string fragments in title</span
							>
						</div>
						<RegexVisualizer class="mt-2" tag="@" :regex="currentRule.tab.title_matcher" />
					</div>
				</label>
				<label class="form-control w-full flex-1">
					<div class="label">
						<span class="label-text text-sm">URL matcher</span>
					</div>
					<input
						v-model="currentRule.tab.url_matcher"
						class="input input-xs input-bordered w-full"
						placeholder="URL matcher"
						required
						type="text"
					/>
					<div v-if="showHelp">
						<div class="label">
							<span class="text-xs opacity-80 label-text-alt">
								Regular expression to search string fragments in URL</span
							>
						</div>
						<RegexVisualizer class="mt-2" tag="$" :regex="currentRule.tab.url_matcher" />
					</div>
				</label>
			</div>
		</details>
	</div>

	<div class="modal-action items-center">
		<p v-if="showHelp" class="py-4 opacity-80">Remember refresh your tabs after saving</p>
		<form v-if="options.showCancel" method="dialog">
			<button class="btn btn-sm">Close <kbd v-if="showHelp" class="kbd kbd-xs">esc</kbd></button>
		</form>
		<button
			:disabled="!isFirstPartFilled"
			class="btn btn-sm btn-outline btn-primary ml-4 group"
			@click="save"
		>
			Save
		</button>
	</div>
</template>
<script lang="ts" setup>
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import { computed, inject, onMounted, ref, watch } from 'vue';
import CustomSelect, { SelectItem } from '../../../../global/CustomSelect.vue';
import NewFeature from '../../../../global/NewFeature.vue';
import {
	_chromeGroupColor,
	_clone,
	_getDetections,
	_getIcons,
} from '../../../../../common/helpers.ts';
import { GLOBAL_EVENTS, Group, Rule } from '../../../../../common/types.ts';
import HelpSwap from '../../../../global/HelpSwap.vue';
import { _getDefaultGroup, _getDefaultRule } from '../../../../../common/storage.ts';
import ShortGroupForm from './ShortGroupForm.vue';
import CloseIcon from '../../../../icons/CloseIcon.vue';
import RegexVisualizer from '../../../../global/RegexVisualizer.vue';
import SettingsIcon from '../../../../icons/SettingsIcon.vue';

const rulesStore = useRulesStore();
export interface Props {
	rule?: Rule;
	options?: {
		showTitle: boolean;
		showCancel: boolean;
		showOptionLink: boolean;
	};
}

const props = withDefaults(defineProps<Props>(), {
	rule: undefined,
	options: () => ({
		showTitle: true,
		showCancel: true,
	}),
});

const emit = defineEmits(['onSave']);

const defaultRule = props.rule ?? _getDefaultRule('', '', '');

const showHelp = ref(false);
const isGroupFormVisible = ref(false);
const newGroup = ref<Group | null>(null);
const currentRule = ref(_clone(rulesStore.currentRule ?? defaultRule));

const isEditMode = computed(() => !!rulesStore.currentRule);

const isCustomIcon = computed(
	() =>
		currentRule.value.tab.icon?.startsWith('http') ||
		currentRule.value.tab.icon?.startsWith('data:')
);

const isFirstPartFilled = computed(() => {
	return currentRule.value.name && currentRule.value.detection && currentRule.value.url_fragment;
});

const isCustomIconFormVisible = ref(false);

isCustomIconFormVisible.value =
	currentRule.value.tab.icon?.startsWith('http') || currentRule.value.tab.icon?.startsWith('data:');

const showGroupForm = (event: MouseEvent) => {
	event.stopPropagation();

	newGroup.value = _getDefaultGroup();

	isGroupFormVisible.value = true;
};

const hideGroupForm = () => {
	isGroupFormVisible.value = false;

	newGroup.value = null;
};

const showCustomIconForm = (event: MouseEvent) => {
	event.stopPropagation();

	currentRule.value.tab.icon = '';
	isCustomIconFormVisible.value = true;
};

const hideCustomIconForm = () => {
	currentRule.value.tab.icon = '';
	isCustomIconFormVisible.value = false;
};

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
	() => currentRule.value.tab.group_id,
	(newGroupId) => {
		if (newGroupId) {
			currentRule.value.tab.pinned = false;
		}
	}
);

const emitter: any = inject('emitter');

const openOptions = () => {
	if (chrome.runtime.openOptionsPage) {
		chrome.runtime.openOptionsPage();
	} else {
		chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
	}
};

const save = async () => {
	if (newGroup.value) {
		await rulesStore.addGroup(newGroup.value);
		currentRule.value.tab.group_id = newGroup.value.id;
	}

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

	emit('onSave');
};

const isAdvancedOpenWhenMounted = ref(false);

onMounted(() => {
	isAdvancedOpenWhenMounted.value =
		!!currentRule.value.tab.title_matcher || !!currentRule.value.tab.url_matcher;
});

const detections = _getDetections();
const icons = _getIcons();
</script>
