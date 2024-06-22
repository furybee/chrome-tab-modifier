<template>
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th scope="col">Name</th>
					<th scope="col">Group</th>
					<th scope="col">Title</th>
					<th scope="col">Detection</th>
					<th scope="col">URL Fragment</th>
					<th scope="col"></th>
					<th scope="col" class="text-right">
						<RefreshButton @on-refresh-click="refresh"></RefreshButton>
					</th>
				</tr>
			</thead>
			<draggable v-model="rules" tag="tbody" item-key="id" @end="onDragEnd">
				<template #item="{ element: rule, index }">
					<tr class="group cursor-pointer hover:bg-base-100" @click="editRule(rule)">
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
								<img
									v-if="rule.tab.icon"
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
							<div class="flex gap-4 invisible group-hover:visible overflow-hidden">
								<button
									class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
									:class="{ invisible: index === 0 }"
									data-tip="Move Up"
									@click.prevent="(event) => moveUp(event, rule.id)"
								>
									<ArrowUpIcon class="!w-4 !h-4" />
								</button>

								<button
									class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
									:class="{ invisible: index === props.rules.length - 1 }"
									data-tip="Move Down"
									@click.prevent="(event) => moveDown(event, rule.id)"
								>
									<ArrowDownIcon class="!w-4 !h-4" />
								</button>
							</div>
						</td>
						<td>
							<div class="flex justify-end gap-8 invisible group-hover:visible overflow-hidden">
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
import { inject, ref } from 'vue';
import { GLOBAL_EVENTS, Group, Rule, RuleModalParams } from '../../../../../common/types.ts';
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import RefreshButton from '../../../../global/RefreshButton.vue';
import { _chromeGroupColor, _shortify } from '../../../../../common/helpers.ts';
import ColorVisualizer from '../TabGroups/ColorVisualizer.vue';
import { computed, watch } from 'vue';
import ArrowDownIcon from '../../../../icons/ArrowDownIcon.vue';
import ArrowUpIcon from '../../../../icons/ArrowUpIcon.vue';
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

const emitter: any = inject('emitter');

const editRule = (rule: Rule) => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, {
		rule,
	} as RuleModalParams);
};

const duplicateRule = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();
	await rulesStore.duplicateRule(ruleId);
	rules.value = [...rulesStore.rules]; // Update the rules array after duplication
};

const moveUp = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();
	await rulesStore.moveUp(ruleId);
	rules.value = [...rulesStore.rules]; // Update the rules array after moving up
};

const moveDown = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();
	await rulesStore.moveDown(ruleId);
	rules.value = [...rulesStore.rules]; // Update the rules array after moving down
};

const deleteRule = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();
	if (confirm('Are you sure you want to delete this rule?')) {
		await rulesStore.deleteRule(ruleId);
		rules.value = [...rulesStore.rules]; // Update the rules array after deletion
	}
};

const onDragEnd = (event: any) => {
	rules.value.forEach((rule, index) => {
		rulesStore.updateRulePosition(rule.id, index);
	});
	rules.value = [...rulesStore.rules]; // Ensure the rules are updated after drag end
};
</script>
