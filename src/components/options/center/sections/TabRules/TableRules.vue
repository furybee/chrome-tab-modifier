<template>
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th scope="col" class="w-8"></th>
					<th scope="col"></th>
					<th scope="col">Name</th>
					<th scope="col">Group</th>
					<th scope="col">Title</th>
					<th scope="col">Detection</th>
					<th scope="col">URL Fragment</th>
					<th scope="col" class="text-right">
						<RefreshButton @on-refresh-click="refresh"></RefreshButton>
					</th>
				</tr>
			</thead>
			<draggable v-model="rules" tag="tbody" item-key="id" @end="onDragEnd">
				<template #item="{ element: rule }">
					<tr class="group cursor-pointer hover:bg-base-100" @click="editRule(rule)">
						<td class="cursor-grab active:cursor-grabbing">
							<div class="opacity-0 group-hover:opacity-50 transition-opacity">
								<GripIcon class="!w-4 !h-4" />
							</div>
						</td>
						<td>
							<div class="tooltip tooltip-right" data-tip="Enable / Disable Rule">
								<input
									v-if="rule.is_enabled"
									:checked="true"
									type="checkbox"
									class="toggle toggle-xs toggle-primary"
									@click.prevent="(event) => toggleRule(event, rule)"
								/>
								<input
									v-else
									type="checkbox"
									class="toggle toggle-xs toggle-success"
									@click.prevent="(event) => toggleRule(event, rule)"
								/>
							</div>
						</td>
						<td scope="row">{{ rule.name }}</td>
						<td>
							<template v-if="!rule.tab.group_id">-</template>
							<div v-else-if="groupsById[rule.tab.group_id]" class="flex items-center gap-2">
								<ColorVisualizer :color="_chromeGroupColor(groupsById[rule.tab.group_id].color)" />
								{{ groupsById[rule.tab.group_id].title }}
							</div>
						</td>
						<td>
							<div class="flex items-center gap-2">
								<span v-if="rule.tab.icon && isEmoji(rule.tab.icon)" class="text-xl">
									{{ rule.tab.icon }}
								</span>
								<img
									v-else-if="rule.tab.icon"
									:alt="rule.name + '_icon'"
									:src="getIconUrl(rule.tab.icon)"
									class="w-6 h-6"
								/>
								{{ rule.tab.title && rule.tab.title !== '' ? rule.tab.title : '' }}
							</div>
						</td>
						<td>
							{{ rule.detection }}
						</td>
						<td>
							<div class="tooltip" :data-tip="rule.url_fragment">
								{{ _shortify(rule.url_fragment, 20) }}
							</div>
						</td>
						<td>
							<div class="flex justify-end gap-8 invisible group-hover:visible overflow-hidden">
								<button
									class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
									data-tip="Copy to clipboard"
									@click.prevent="(event) => copyRule(event, rule.id)"
								>
									<ClipboardIcon class="!w-4 !h-4" />
								</button>

								<button
									class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
									data-tip="Duplicate"
									@click.prevent="(event) => duplicateRule(event, rule.id)"
								>
									<DuplicateIcon class="!w-4 !h-4" />
								</button>

								<button
									class="btn btn-xs btn-circle btn-outline tooltip flex items-center justify-items-center btn-error"
									data-tip="Delete"
									@click.prevent="(event) => deleteRule(event, rule.id)"
								>
									<DeleteIcon class="!w-4 !h-4" />
								</button>
							</div>
						</td>
					</tr>
				</template>
			</draggable>
		</table>
	</div>
</template>
<script lang="ts" setup>
import DuplicateIcon from '../../../../icons/DuplicateIcon.vue';
import DeleteIcon from '../../../../icons/DeleteIcon.vue';
import GripIcon from '../../../../icons/GripIcon.vue';
import ClipboardIcon from '../../../../icons/ClipboardIcon.vue';
import { computed, inject, ref, watch } from 'vue';
import { GLOBAL_EVENTS, Group, Rule, RuleModalParams } from '../../../../../common/types.ts';
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import RefreshButton from '../../../../global/RefreshButton.vue';
import { _chromeGroupColor, _shortify } from '../../../../../common/helpers.ts';
import ColorVisualizer from '../TabGroups/ColorVisualizer.vue';
import draggable from 'vuedraggable';

const props = defineProps<{
	rules: Rule[];
	groups: Group[];
}>();

const rulesStore = useRulesStore();
const rules = ref([...props.rules]);

// Watch for changes in props.rules and update the reactive rules array
watch(
	() => props.rules,
	(newRules) => {
		rules.value = [...newRules];
	}
);

const groupsById = computed(() => {
	return props.groups.reduce(
		(acc, group) => {
			acc[group.id] = group;
			return acc;
		},
		{} as Record<string, Group>
	);
});

const refresh = async () => {
	await rulesStore.init();
	rules.value = [...rulesStore.rules]; // Ensure the rules are refreshed from the store
};

const getIconUrl = (icon: string): string | undefined => {
	if (!icon) return;

	if (icon.startsWith('http') || icon.startsWith('data:')) {
		return icon;
	}

	return chrome.runtime.getURL('/assets/' + icon);
};

const isEmoji = (str: string): boolean => {
	// Check if it's a short string (emojis are typically 1-10 characters due to modifiers)
	if (str.length > 10) return false;

	// Regex to detect emoji characters
	const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}\p{Emoji_Modifier}\p{Emoji_Presentation}]+$/u;
	return emojiRegex.test(str);
};

const emitter: any = inject('emitter');

const editRule = (rule: Rule) => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, {
		rule,
	} as RuleModalParams);
};

const toggleRule = async (event: MouseEvent, rule: Rule) => {
	event.stopPropagation();

	if (typeof rule.is_enabled === 'undefined') {
		rule.is_enabled = true;
	}

	await rulesStore.toggleRule(rule.id);
	rules.value = [...rulesStore.rules]; // Update the rules array after toggling
};

const copyRule = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();
	try {
		await rulesStore.copyRuleToClipboard(ruleId);
		emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
			type: 'success',
			message: 'Rule copied to clipboard! You can now share it with others.',
		});
	} catch (error) {
		emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
			type: 'error',
			message: 'Failed to copy rule to clipboard',
		});
		console.error(error);
	}
};

const duplicateRule = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();
	await rulesStore.duplicateRule(ruleId);
	rules.value = [...rulesStore.rules]; // Update the rules array after duplication
};

const deleteRule = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();
	if (confirm('Are you sure you want to delete this rule?')) {
		await rulesStore.deleteRule(ruleId);
		rules.value = [...rulesStore.rules]; // Update the rules array after deletion
	}
};

const onDragEnd = () => {
	rules.value.forEach((rule, index) => {
		rulesStore.updateRulePosition(rule.id, index);
	});
	rules.value = [...rulesStore.rules]; // Ensure the rules are updated after drag end
};
</script>
