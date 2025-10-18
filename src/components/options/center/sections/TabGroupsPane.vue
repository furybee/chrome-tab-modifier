<template>
	<div>
		<EmptyGroups v-if="rulesStore.groups.length === 0" />

		<div v-else class="container mx-auto max-w-5xl p-4">
			<div class="card bg-base-200">
				<div class="card-body">
					<TableGroups :groups="rulesStore.groups" />
				</div>
			</div>

			<Disclaimer :tips="groupsTips" />
		</div>

		<dialog ref="addGroupModal" class="modal">
			<div class="modal-box">
				<GroupForm v-if="isGroupFormModalOpened" />
			</div>
		</dialog>
	</div>
</template>

<script lang="ts" setup>
import { useRulesStore } from '../../../../stores/rules.store.ts';
import EmptyGroups from './TabGroups/EmptyGroups.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { GLOBAL_EVENTS, GroupModalParams } from '../../../../common/types.ts';
import GroupForm from './TabGroups/GroupForm.vue';
import TableGroups from './TabGroups/TableGroups.vue';
import Disclaimer from '../../../global/Disclaimer.vue';

const rulesStore = useRulesStore();
rulesStore.init();

const addGroupModal = ref<HTMLDialogElement | null>(null);
const isGroupFormModalOpened = ref(false);

const emitter: any = inject('emitter');

const groupsTips = [
	{
		id: 1,
		icon: '💡',
		text: 'You can backup and import your groups in',
		linkText: 'Settings',
		action: 'navigate-settings',
	},
	{
		id: 2,
		icon: '🎨',
		text: 'Groups help visually organize tabs in your browser',
	},
	{
		id: 3,
		icon: '🔗',
		text: 'Assign groups to rules to automatically organize matching tabs',
	},
	{
		id: 4,
		icon: '📌',
		text: 'Pinned tabs cannot be grouped - unpin them first',
	},
];

onMounted(() => {
	emitter.on(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL, openAddGroupModal);
	emitter.on(GLOBAL_EVENTS.CLOSE_ADD_GROUP_MODAL, closeAddGroupModal);
});

onUnmounted(() => {
	emitter.off(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL, openAddGroupModal);
	emitter.off(GLOBAL_EVENTS.CLOSE_ADD_GROUP_MODAL, closeAddGroupModal);
});

const openAddGroupModal = (params?: GroupModalParams) => {
	if (!addGroupModal.value) {
		return;
	}

	// Reset current group
	rulesStore.setCurrentGroup();

	if (params !== undefined && params.group !== undefined) {
		rulesStore.setCurrentGroup(params.group);
	}

	isGroupFormModalOpened.value = true;
	addGroupModal.value.showModal();
};

const closeAddGroupModal = () => {
	if (!addGroupModal.value) {
		return;
	}

	isGroupFormModalOpened.value = false;
	addGroupModal.value.close();
};
</script>
<style scoped></style>
