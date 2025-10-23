<template>
	<div>
		<EmptyRules v-if="rulesStore.rules.length === 0" />

		<div v-else class="container mx-auto max-w-5xl p-4">
			<div class="card bg-base-200">
				<div class="card-body">
					<TableRules :rules="rulesStore.rules" :groups="rulesStore.groups" />
				</div>
			</div>

			<Disclaimer :tips="rulesTips" />
		</div>

		<dialog ref="addRuleModal" class="modal">
			<div class="modal-box w-11/12 max-w-4xl">
				<RuleForm v-if="isRuleFormModalOpened" @on-save="refreshRules" />
			</div>
		</dialog>
	</div>
</template>

<script lang="ts" setup>
import { useRulesStore } from '../../../../stores/rules.store.ts';
import EmptyRules from './TabRules/EmptyRules.vue';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import TableRules from './TabRules/TableRules.vue';
import { GLOBAL_EVENTS, RuleModalParams } from '../../../../common/types.ts';
import RuleForm from './TabRules/RuleForm.vue';
import Disclaimer from '../../../global/Disclaimer.vue';

const rulesStore = useRulesStore();
rulesStore.init();

const addRuleModal = ref<HTMLDialogElement | null>(null);
const isRuleFormModalOpened = ref(false);

const emitter: any = inject('emitter');

const refreshRules = async () => {
	await rulesStore.init();
};

const rulesTips = [
	{
		id: 1,
		icon: '💡',
		text: 'You can backup and import your rules in',
		linkText: 'Settings',
		action: 'navigate-settings',
	},
	{
		id: 2,
		icon: '🎯',
		text: 'Rules are applied in order - drag to reorder them',
	},
	{
		id: 3,
		icon: '⚡',
		text: 'Use RegEx detection for advanced URL matching',
	},
	{
		id: 4,
		icon: '🔍',
		text: 'Right-click any page to quickly rename its tab',
	},
];

onMounted(() => {
	emitter.on(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, openAddRuleModal);
	emitter.on(GLOBAL_EVENTS.CLOSE_ADD_RULE_MODAL, closeAddRuleModal);

	if (!addRuleModal.value) {
		return;
	}

	addRuleModal.value.addEventListener('close', () => {
		closeAddRuleModal();
	});
});

onUnmounted(() => {
	emitter.off(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL);
	emitter.off(GLOBAL_EVENTS.CLOSE_ADD_RULE_MODAL);
});

const openAddRuleModal = (params?: RuleModalParams) => {
	if (!addRuleModal.value) {
		return;
	}

	// Reset current rule
	rulesStore.setCurrentRule();

	if (params?.rule) {
		rulesStore.setCurrentRule(params.rule);
	}

	// mount RuleForm component
	isRuleFormModalOpened.value = true;

	addRuleModal.value.showModal();
};

const closeAddRuleModal = () => {
	isRuleFormModalOpened.value = false;

	if (!addRuleModal.value) {
		return;
	}

	addRuleModal.value.close();
};
</script>
<style scoped></style>
