<template>
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th>Name</th>
					<th>Group</th>
					<th>Title</th>
					<th>Detection</th>
					<th>URL Fragment</th>
					<th class="text-right">
						<RefreshButton @on-refresh-click="refresh"></RefreshButton>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(rule, index) in props.rules"
					:key="index"
					class="group cursor-pointer hover:bg-base-100"
					@click="editRule(rule)"
				>
					<td>
						{{ rule.name }}
					</td>
					<td>
						<template v-if="!rule.tab.group_id">-</template>
						<div v-else class="flex items-center gap-2">
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
							{{ rule.tab.title && rule.tab.title !== '' ? rule.tab.title : '{title}' }}
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
								data-tip="Duplicate"
								@click.prevent="(event) => duplicateRule(event, index)"
							>
								<DuplicateIcon class="!w-4 !h-4" />
							</button>

							<button
								class="btn btn-xs btn-circle btn-outline tooltip flex items-center justify-items-center btn-error"
								data-tip="Delete"
								@click.prevent="(event) => deleteRule(event, index)"
							>
								<DeleteIcon class="!w-4 !h-4" />
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts" setup>
import DuplicateIcon from '../../../../icons/DuplicateIcon.vue';
import DeleteIcon from '../../../../icons/DeleteIcon.vue';
import { inject } from 'vue';
import { GLOBAL_EVENTS, Group, Rule, RuleModalParams } from '../../../../../common/types.ts';
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import RefreshButton from '../../../../global/RefreshButton.vue';
import { _chromeGroupColor, _shortify } from '../../../../../common/helpers.ts';
import ColorVisualizer from '../TabGroups/ColorVisualizer.vue';
import { computed } from 'vue';

const props = defineProps<{
	rules: Rule[];
	groups: Group[];
}>();

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

	if (icon.startsWith('http')) {
		return icon;
	}

	return chrome.runtime.getURL('/assets/' + icon);
};

const rulesStore = useRulesStore();
const emitter = inject('emitter');

const editRule = (rule: Rule) => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, {
		rule,
	} as RuleModalParams);
};

const duplicateRule = async (event: MouseEvent, index: number) => {
	event.stopPropagation();

	await rulesStore.duplicateRule(index);
};

const deleteRule = async (event: MouseEvent, index: number) => {
	event.stopPropagation();

	if (confirm('Are you sure you want to delete this rule?')) {
		await rulesStore.deleteRule(index);
	}
};
</script>

<style scoped></style>
