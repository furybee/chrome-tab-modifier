<template>
  <div>
    <EmptyRules v-if="rulesStore.rules.length === 0" />

    <div v-else class="p-4">
      <TableRules :rules="rulesStore.rules"/>
    </div>

    <dialog ref="addRuleModal" class="modal">
      <RuleForm />
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import {Rule, useRulesStore} from "../../../../stores/rules.store.ts";
import EmptyRules from "./TabRules/EmptyRules.vue";
import {inject, onMounted, onUnmounted, ref} from "vue";
import TableRules from "./TabRules/TableRules.vue";
import {GLOBAL_EVENTS} from "../../../../types.ts";
import RuleForm from "./TabRules/RuleForm.vue";

const rulesStore = useRulesStore();
rulesStore.init();

const addRuleModal = ref(null);

const emitter = inject('emitter');

onMounted(() => {
  emitter.on(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, openAddRuleModal);
});

onUnmounted(() => {
  emitter.off(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, openAddRuleModal);
});

const openAddRuleModal = (rule?: Rule) => {
  if (!addRuleModal.value) {
    return;
  }

  rulesStore.setCurrentRule(rule);

  addRuleModal.value.showModal();
};

const saveRule = async () => {
  const exampleRule = {
    $$hashKey: "object:30",
    detection: "CONTAINS",
    name: "Rule created from right-click (www.google.com/...)",
    tab: {
      icon: "chrome/bookmarks.png",
      muted: true,
      pinned: false,
      protected: false,
      title: 'Gogolus',
      title_matcher: null,
      unique: false,
      url_matcher: null
    },
    url_fragment: "https://www.google.com/"
  };

  await rulesStore.addRule(exampleRule);
};
</script>
<style scoped>

</style>
