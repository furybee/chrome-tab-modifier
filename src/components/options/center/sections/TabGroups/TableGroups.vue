<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra">
      <thead>
      <tr>
        <th>Title</th>
        <th>Color</th>
        <th>Collapsed</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(group, index) in props.groups" :key="index" class="cursor-pointer group hover:bg-base-100"
          @click="editGroup(group, index)"
      >
        <td>{{ group.title }}</td>
        <td>
          <ColorVisualizer :color="_chromeColor(group.color)"/>
        </td>
        <td>{{ group.collapsed }}</td>
        <td class="invisible group-hover:visible">
          <div class="flex justify-end gap-8">
            <button class="btn btn-xs btn-circle btn-outline tooltip flex items-center justify-items-center btn-error"
                    data-tip="Delete"
                    @click="deleteGroup(index)"
            >
              <DeleteIcon class="!w-4 !h-4"/>
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import DeleteIcon from "../../../../../icons/DeleteIcon.vue";
import {inject} from "vue";
import {GLOBAL_EVENTS, Group, GroupModalParams} from "../../../../../types.ts";
import {useRulesStore} from "../../../../../stores/rules.store.ts";
import {_chromeColor} from "../../../../../helpers.ts";
import ColorVisualizer from "./ColorVisualizer.vue";

const props = defineProps<{
  groups: Group[];
}>();

const rulesStore = useRulesStore();
const emitter = inject('emitter');

const editGroup = (group: Group, index: number) => {
  emitter.emit(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL, {
    index,
    group,
  } as GroupModalParams);
};

const deleteGroup = (index: number) => {
  rulesStore.deleteGroup(index);
};
</script>

<style scoped>

</style>
