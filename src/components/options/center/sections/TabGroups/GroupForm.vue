<template>
  <h3 class="font-bold text-lg flex justify-between">
    <span v-if="isEditMode">Edit group</span>
    <span v-else>Add a new group</span>

    <label
      class="btn btn-xs btn-circle bg-transparent border-none swap swap-rotate"
    >
      <input v-model="showHelp" type="checkbox" />
      <svg
        class="swap-off w-4 h-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <svg
        class="swap-on w-4 h-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </label>
  </h3>

  <div class="flex flex-col gap-2 mt-2">
    <div class="form-control w-full flex-1">
      <label class="label">
        <span class="label-text text-sm">Title</span>
      </label>
      <input
        v-model="currentGroup.title"
        class="input input-xs input-bordered w-full"
        placeholder="e.g. Google"
        required
        type="text"
      />
      <div v-if="showHelp" class="label">You can set a title for your tab</div>
    </div>

    <div class="form-control w-full flex-1">
      <div class="label">
        <span class="label-text text-sm">Color</span>
      </div>
      <div class="flex gap-2">
        <CustomSelect
          v-model="currentGroup.color"
          :items="availableGroupColors"
        />
      </div>
      <div v-if="showHelp" class="label">
        <span class="text-xs label-text-alt"
          >You can set a color for your group</span
        >
      </div>

      <div class="form-control mt-4">
        <label class="cursor-pointer label">
          <span class="label-text text-sm">Collapsed</span>
          <input
            v-model="currentGroup.collapsed"
            checked
            class="toggle toggle-sm toggle-primary"
            type="checkbox"
          />
        </label>
      </div>
    </div>

    <div class="modal-action items-center">
      <p v-if="showHelp" class="py-4">
        Remember refresh your tabs after saving
      </p>
      <form method="dialog">
        <button class="btn btn-sm">
          Close <kbd v-if="showHelp" class="kbd kbd-xs">esc</kbd>
        </button>
      </form>
      <button
        class="btn btn-sm btn-outline btn-primary ml-4 group"
        @click="save"
      >
        Save
        <span v-if="showHelp">
          <kbd
            class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary"
            >⌘</kbd
          ><kbd
            class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary"
            >S</kbd
          >
        </span>
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRulesStore } from "../../../../../stores/rules.store.ts";
import { computed, inject, ref, watch } from "vue";
import CustomSelect from "../../../../global/CustomSelect.vue";
import { _chromeColor, _clone } from "../../../../../helpers.ts";
import { GLOBAL_EVENTS } from "../../../../../types.ts";

const emitter = inject("emitter");
const rulesStore = useRulesStore();

const isEditMode = computed(() => !!rulesStore.currentGroup);

const defaultGroup = {
  title: "",
  color: "grey",
  collapsed: false,
};

const showHelp = ref(false);
const currentGroup = ref(_clone(rulesStore.currentGroup ?? defaultGroup));

const availableGroupColors = ref([
  { label: "grey", value: "grey", color: _chromeColor("grey") },
  { label: "blue", value: "blue", color: _chromeColor("blue") },
  { label: "red", value: "red", color: _chromeColor("red") },
  { label: "yellow", value: "yellow", color: _chromeColor("yellow") },
  { label: "green", value: "green", color: _chromeColor("green") },
  { label: "pink", value: "pink", color: _chromeColor("pink") },
  { label: "purple", value: "purple", color: _chromeColor("purple") },
  { label: "cyan", value: "cyan", color: _chromeColor("cyan") },
  { label: "orange", value: "orange", color: _chromeColor("orange") },
]);

watch(
  () => rulesStore.currentGroup,
  (newGroup) => {
    currentGroup.value = newGroup ?? defaultGroup;
  },
);

const save = async () => {
  if (isEditMode.value) {
    await rulesStore.updateGroup(currentGroup.value);
  } else {
    await rulesStore.addGroup(currentGroup.value);
  }

  emitter.emit(GLOBAL_EVENTS.CLOSE_ADD_GROUP_MODAL);
};
</script>
