<template>
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th>Name</th>
					<th>Title</th>
					<th>Detection</th>
					<th>URL Fragment</th>
					<th />
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(rule, index) in props.rules"
					:key="index"
					class="group cursor-pointer hover:bg-base-100"
					@click="editRule(rule, index)"
				>
					<td>
						{{ rule.name }}
					</td>
					<td>
						<div class="flex items-center gap-2">
							<img :alt="rule.name + '_icon'" :src="getIconUrl(rule.tab.icon)" class="w-6 h-6" />
							{{ rule.tab.title && rule.tab.title !== '' ? rule.tab.title : '{title}' }}
						</div>
					</td>
					<td>
						{{ rule.detection }}
					</td>
					<td>{{ rule.url_fragment }}</td>
					<td>
						<div class="flex justify-end gap-8 invisible group-hover:visible overflow-hidden">
							<button
								class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
								data-tip="Duplicate"
								@click="duplicateRule(index)"
							>
								<DuplicateIcon class="!w-4 !h-4" />
							</button>

							<button
								class="btn btn-xs btn-circle btn-outline tooltip flex items-center justify-items-center btn-error"
								data-tip="Delete"
								@click="deleteRule(index)"
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
import DuplicateIcon from '../../../../../icons/DuplicateIcon.vue';
import DeleteIcon from '../../../../../icons/DeleteIcon.vue';
import { inject } from 'vue';
import { GLOBAL_EVENTS, Rule, RuleModalParams } from '../../../../../types.ts';
import { useRulesStore } from '../../../../../stores/rules.store.ts';

const props = defineProps<{
	rules: Rule[];
}>();

const getIconUrl = (icon: string) => {
	if (icon.startsWith('http')) {
		return icon;
	}

	return chrome.runtime.getURL('/assets/' + icon);
};

const rulesStore = useRulesStore();
const emitter = inject('emitter');

const editRule = (rule: Rule, index: number) => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, {
		index,
		rule,
	} as RuleModalParams);
};

const duplicateRule = (index: number) => {
	rulesStore.duplicateRule(index);
};

const deleteRule = (index: number) => {
	rulesStore.deleteRule(index);
};
</script>

<style scoped></style>
