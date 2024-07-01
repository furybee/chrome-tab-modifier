<template>
	<div class="overflow-x-auto">
		<table class="table table-zebra">
			<thead>
				<tr>
					<th>{{ $translate('table_groups_title') }}</th>
					<th>{{ $translate('table_groups_color') }}</th>
					<th>{{ $translate('table_groups_collapsed') }}</th>
					<th />
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(group, index) in props.groups"
					:key="index"
					class="cursor-pointer group hover:bg-base-100"
					@click="editGroup(group)"
				>
					<td>{{ group.title }}</td>
					<td>
						<ColorVisualizer :color="_chromeGroupColor(group.color)" />
					</td>
					<td>{{ group.collapsed }}</td>
					<td>
						<div class="flex justify-end gap-8 invisible group-hover:visible overflow-hidden">
							<button
								class="btn btn-xs btn-circle btn-outline tooltip flex items-center justify-items-center btn-error"
								data-tip="Delete"
								@click.prevent="(event) => deleteGroup(event, group.id)"
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
import DeleteIcon from '../../../../icons/DeleteIcon.vue';
import { inject } from 'vue';
import { GLOBAL_EVENTS, Group, GroupModalParams } from '../../../../../common/types.ts';
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import { _chromeGroupColor, translate } from '../../../../../common/helpers.ts';
import ColorVisualizer from './ColorVisualizer.vue';

const props = defineProps<{
	groups: Group[];
}>();

const rulesStore = useRulesStore();
const emitter: any = inject('emitter');

const editGroup = (group: Group) => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL, {
		group,
	} as GroupModalParams);
};

const deleteGroup = async (event: any, groupId: string) => {
	event.stopPropagation();

	if (confirm(translate('table_groups_delete_confirm'))) {
		await rulesStore.deleteGroup(groupId);
	}
};
</script>

<style scoped></style>
