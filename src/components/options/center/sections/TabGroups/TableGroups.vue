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
      <tr v-for="(group, index) in props.groups" :key="index" class="group">
        <td>{{ group.title }}</td>
        <td>{{ group.color }}</td>
        <td>{{ group.collapsed }}</td>
        <td class="invisible group-hover:visible grid lg:grid-cols-3 gap-2">
          <button class="btn btn-xs btn-circle tooltip flex items-center justify-items-center"
                  data-tip="Edit"
                  @click="editGroup(group, index)"
          >
            <EditIcon class="!w-4 !h-4"/>
          </button>

          <button class="btn btn-xs btn-circle btn-outline tooltip flex items-center justify-items-center btn-error"
                  data-tip="Delete"
                  @click="deleteGroup(index)"
          >
            <DeleteIcon class="!w-4 !h-4"/>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import EditIcon from "../../../../../icons/EditIcon.vue";
import DeleteIcon from "../../../../../icons/DeleteIcon.vue";
import {inject} from "vue";
import {GLOBAL_EVENTS, Group, GroupModalParams} from "../../../../../types.ts";
import {useRulesStore} from "../../../../../stores/rules.store.ts";

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
