<template>
	<RefreshButton class="absolute right-5 top-5" @on-refresh-click="refresh"></RefreshButton>

	<div v-if="groupedRules && ungroupedRules" class="flex flex-col relative gap-6 overflow-x-auto">
		<div v-for="(groupRules, groupId) in groupedRules" :key="groupId">
			<h2 class="flex items-center gap-2 font-semibold mb-2">
				<ColorVisualizer :color="_chromeGroupColor(groupsById[groupId].color)" />
				{{ groupsById[groupId].title }}
			</h2>
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>Name</th>
						<th>Title</th>
						<th>Detection</th>
						<th>URL Fragment</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="(rule, index) in groupRules"
						:key="rule.id"
						class="group cursor-pointer hover:bg-base-100"
						@click="editRule(rule)"
					>
						<td>{{ rule.name }}</td>
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
						<td>{{ rule.detection }}</td>
						<td>
							<div class="tooltip" :data-tip="rule.url_fragment">
								{{ _shortify(rule.url_fragment, 20) }}
							</div>
						</td>
						<td>
							<div class="flex justify-end gap-8 invisible group-hover:visible overflow-hidden">
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
									:class="{ invisible: index === rules.length - 1 }"
									data-tip="Move Down"
									@click.prevent="(event) => moveDown(event, rule.id)"
								>
									<ArrowDownIcon class="!w-4 !h-4" />
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
				</tbody>
			</table>
		</div>

		<div v-if="ungroupedRules.length" class="mt-4">
			<h2 class="font-semibold mb-2">Ungrouped Rules</h2>
			<table class="table table-zebra">
				<thead>
					<tr>
						<th>Name</th>
						<th>Title</th>
						<th>Detection</th>
						<th>URL Fragment</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="(rule, index) in ungroupedRules"
						:key="rule.id"
						class="group cursor-pointer hover:bg-base-100"
						@click="editRule(rule)"
					>
						<td>{{ rule.name }}</td>
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
						<td>{{ rule.detection }}</td>
						<td>
							<div class="tooltip" :data-tip="rule.url_fragment">
								{{ _shortify(rule.url_fragment, 20) }}
							</div>
						</td>
						<td>
							<div class="flex justify-end gap-8 invisible group-hover:visible overflow-hidden">
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
									:class="{ invisible: index === ungroupedRules.length - 1 }"
									data-tip="Move Down"
									@click.prevent="(event) => moveDown(event, rule.id)"
								>
									<ArrowDownIcon class="!w-4 !h-4" />
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
				</tbody>
			</table>
		</div>
	</div>
</template>
<script lang="ts" setup>
import DuplicateIcon from '../../../../icons/DuplicateIcon.vue';
import DeleteIcon from '../../../../icons/DeleteIcon.vue';
import { inject, computed } from 'vue';
import { GLOBAL_EVENTS, Group, Rule, RuleModalParams } from '../../../../../common/types.ts';
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import RefreshButton from '../../../../global/RefreshButton.vue';
import { _chromeGroupColor, _shortify } from '../../../../../common/helpers.ts';
import ColorVisualizer from '../TabGroups/ColorVisualizer.vue';
import ArrowDownIcon from '../../../../icons/ArrowDownIcon.vue';
import ArrowUpIcon from '../../../../icons/ArrowUpIcon.vue';

const props = defineProps<{
	rules: Rule[];
	groups: Group[];
}>();

const rulesStore = useRulesStore();
const emitter: any = inject('emitter');

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
};

const getIconUrl = (icon: string): string | undefined => {
	if (!icon) return;

	if (icon.startsWith('http') || icon.startsWith('data:')) {
		return icon;
	}

	return chrome.runtime.getURL('/assets/' + icon);
};

const editRule = (rule: Rule) => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, {
		rule,
	} as RuleModalParams);
};

const duplicateRule = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();

	await rulesStore.duplicateRule(ruleId);
};

const moveUp = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();

	await rulesStore.moveUp(ruleId);
};

const moveDown = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();

	await rulesStore.moveDown(ruleId);
};

const deleteRule = async (event: MouseEvent, ruleId: string) => {
	event.stopPropagation();

	if (confirm('Are you sure you want to delete this rule?')) {
		await rulesStore.deleteRule(ruleId);
	}
};

// Regroup rules by group_id
const groupedRules = computed(() => {
	return props.rules.reduce(
		(acc, rule) => {
			const groupId = rule.tab.group_id;
			if (groupId) {
				if (!acc[groupId]) acc[groupId] = [];
				acc[groupId].push(rule);
			}
			return acc;
		},
		{} as Record<string, Rule[]>
	);
});

const ungroupedRules = computed(() => {
	return props.rules.filter((rule) => !rule.tab.group_id);
});
</script>
