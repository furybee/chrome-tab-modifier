<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra">
      <thead>
      <tr>
        <th>Name</th>
        <th>Detection</th>
        <th>URL Fragment</th>
        <th>Icon</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
          <tr v-for="(rule, index) in props.rules" :key="index" class="group">
            <td>{{ rule.name }}</td>
            <td>{{ rule.detection }}</td>
            <td>{{ rule.url_fragment }}</td>
            <td><img :alt="rule.name + '_icon'" :src="getIconUrl(rule.tab.icon)" class="w-6 h-6"></td>
            <td class="invisible group-hover:visible grid lg:grid-cols-3 gap-2">
              <button class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
                      data-tip="Edit"
                      @click="editRule(rule)"
              >
                <EditIcon class="!w-4 !h-4" />
              </button>

              <button class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
                      data-tip="Duplicate"
                      @click="duplicateRule(rule)"
              >
                <DuplicateIcon class="!w-4 !h-4" />
              </button>

              <button class="btn btn-xs btn-circle btn-outline tooltip flex items-center justify-items-center btn-error"
                      data-tip="Delete"
                      @click="deleteRule(rule)"
              >
                <DeleteIcon class="!w-4 !h-4" />
              </button>
            </td>
          </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import {Rule} from "../../../../../stores/rules.store.ts";
import DuplicateIcon from "../../../../../icons/DuplicateIcon.vue";
import EditIcon from "../../../../../icons/EditIcon.vue";
import DeleteIcon from "../../../../../icons/DeleteIcon.vue";
import {inject} from "vue";
import {GLOBAL_EVENTS} from "../../../../../types.ts";

const props = defineProps<{
  rules: Rule[];
}>();

const getIconUrl = (icon: string) => {
  console.log(icon);

  if (icon.startsWith('http')) {
    return icon;
  }

  return chrome.runtime.getURL('/assets/' + icon);
};

const emitter = inject('emitter');

const editRule = (rule: Rule) => {
  emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL, rule);
};
const duplicateRule = (rule: Rule) => {
  console.log('duplicateRule', rule);
};
const deleteRule = (rule: Rule) => {
  console.log('deleteRule', rule);
};
</script>

<style scoped>

</style>
