<template>
	<div>
		<EmptyRules v-if="rulesStore.rules.length === 0" />

		<div v-else class="container mx-auto max-w-5xl p-4">
			<div class="card bg-base-200">
				<div class="card-body">
					<TableRules :rules="rulesStore.rules" :groups="rulesStore.groups" />
				</div>
			</div>
		</div>

		<dialog ref="addRuleModal" class="modal">
			<div class="modal-box w-11/12 max-w-5xl">
				<RuleForm v-if="isRuleFormModalOpened" />
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

const rulesStore = useRulesStore();
rulesStore.init();

const addRuleModal = ref<HTMLDialogElement | null>(null);
const isRuleFormModalOpened = ref(false);

const emitter = inject('emitter');

onMounted(() => {
	emitter.on(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, openAddRuleModal);
	emitter.on(GLOBAL_EVENTS.CLOSE_ADD_RULE_MODAL, closeAddRuleModal);
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

	if (params !== undefined && params.rule !== undefined && params.index !== undefined) {
		rulesStore.setCurrentRule(params.rule, params.index);
	}

	// mount RuleForm component
	isRuleFormModalOpened.value = true;

	addRuleModal.value.showModal();
};

const closeAddRuleModal = () => {
	if (!addRuleModal.value) {
		return;
	}

	isRuleFormModalOpened.value = false;

	addRuleModal.value.close();
};
</script>
<style scoped></style>
