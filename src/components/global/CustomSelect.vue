<template>
  <div class="dropdown w-full">
    <div class="btn btn-xs w-full flex flex-row justify-between items-center" role="button" tabindex="0">
      <div class="flex items-center">
        <img v-if="currentItem?.icon" :src="currentItem.icon" alt="_icon" class="w-4 h-4 mr-2"/>
        {{ currentItem?.label ?? '' }}
      </div>
      <span v-if="props.items.length === 0">-- no items --</span>
      <ChevronDownIcon class="!w-4 !h-4 ml-2"/>
    </div>
    <ul v-show="props.items.length > 0"
        class="p-2 shadow menu dropdown-content z-[1] bg-base-300 rounded-box max-h-52 overflow-x-hidden overflow-y-auto flex flex-row"
        tabindex="0">
      <li v-for="(item, index) in props.items" :key="index" class="w-full" @click="onItemSelected(item)">
        <a>
          <img v-if="item.icon" :src="item.icon" alt="_icon" class="w-6 h-6 mr-2"/> {{ item.label }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import ChevronDownIcon from "../../icons/ChevronDownIcon.vue";

interface SelectItem {
  icon?: string;
  value: string;
  label: string;
}

const model = defineModel();
const icon = ref('')

const props = defineProps<{
  items: SelectItem[];
}>();

const onItemSelected = (item: SelectItem) => {
  icon.value = item.icon ?? '';
  model.value = item.value;
};

const currentItem = computed(() => {
  return props.items.find(item => item.value === model.value);
});

</script>

<style scoped>

</style>
