<template>
    <h3 class="font-bold text-lg flex justify-between">
      <span v-if="isEditMode">Edit rule</span>
      <span v-else>Add a new rule</span>

      <label class="btn btn-xs btn-circle bg-transparent border-none swap swap-rotate">
        <input v-model="showHelp" type="checkbox"/>
        <svg class="swap-off w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        <svg class="swap-on w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </label>
    </h3>

    <div class="flex gap-2 mt-2">
      <label class="form-control w-full max-w-xs flex-1">
        <div class="label">
          <span class="label-text text-sm">Name</span>
        </div>
        <input v-model="currentRule.name" class="input input-xs input-bordered w-full max-w-xs"
               placeholder="e.g. Pinned GMail" required type="text"/>
        <div v-if="showHelp" class="label">
          <span class="text-xs label-text-alt">Give an explicit name, just for you</span>
        </div>
      </label>

      <label class="form-control w-full max-w-xs flex-0">
        <div class="label">
          <span class="label-text text-sm">Detection</span>
        </div>
        <select v-model="currentRule.detection" class="select select-xs select-bordered">
          <option v-for="(detection, index) in detections" :key="index" :value="detection.value">
            {{ detection.name }}
          </option>
        </select>
      </label>

      <label class="form-control w-full max-w-xs flex-1">
        <div class="label">
          <span class="label-text text-sm">URL Fragment</span>
        </div>
        <input v-model="currentRule.url_fragment" class="input input-xs input-bordered w-full max-w-xs"
               placeholder="e.g mail.google.com" required type="text"/>
        <div v-if="showHelp" class="label">
          <span class="text-xs label-text-alt">URL fragment to find</span>
        </div>
      </label>
    </div>

    <div v-if="isFirstPartFilled" class="mt-6">
      <hr class="border-base-300">
      <label class="form-control w-full flex-1 mt-4">
        <div class="label">
          <span class="label-text text-sm">Tab title</span>
        </div>
        <input v-model="currentRule.tab.title" class="input input-xs input-bordered w-full"
               placeholder="e.g. Hey {title}" required type="text"/>
        <div class="label">
        <span v-if="showHelp" class="text-xs label-text-alt">
          You can inject any DOM content with {selector}. Examples: {title} for website title, {h1}, {#id}, {.class}, etc. (Read the help section)
        </span>
        </div>
      </label>

      <div class="flex gap-2">
        <label class="form-control w-full max-w-xs flex-0">
          <div class="label">
            <span class="label-text text-sm">Icon</span>
          </div>

          <div class="flex w-full gap-2">
            <CustomSelect v-model="currentRule.tab.icon" :items="icons"/>
          </div>
        </label>


        <label class="form-control w-full flex-1">
          <div class="label">
            <span class="label-text text-sm">Custom Icon</span>
          </div>
          <input v-model="customIcon" class="input input-xs input-bordered w-full"
                 placeholder="e.g. https://google.com/favicon.ico" required type="text"/>
          <div v-if="showHelp" class="label">
            <span class="text-xs label-text-alt">You can set a custom URL or data URI for the new icon, no local path accepted</span>
          </div>
        </label>
      </div>

      <div class="flex gap-2 mt-4">
        <label class="form-control w-full max-w-xs flex-0">
          <div class="label">
            <span class="label-text text-sm">Group <NewFeature/></span>
          </div>

          <CustomSelect v-model="currentRule.tab.group_id" :items="availableGroups"/>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-6">
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Pinned</span>
            <input v-model="currentRule.tab.pinned" :disabled="!!currentRule.tab.group_id" checked
                   class="toggle toggle-sm toggle-primary" type="checkbox"/>
          </label>
        </div>
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Ask before closing</span>
            <input v-model="currentRule.tab.protected" checked class="toggle toggle-sm toggle-primary" type="checkbox"/>
          </label>
        </div>
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Unique</span>
            <input v-model="currentRule.tab.unique" checked class="toggle toggle-sm toggle-primary" type="checkbox"/>
          </label>
        </div>
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Muted</span>
            <input v-model="currentRule.tab.muted" checked class="toggle toggle-sm toggle-primary" type="checkbox"/>
          </label>
        </div>
      </div>

      <details class="mt-6">
        <summary>Advanced</summary>
        <div class="flex gap-2">
          <label class="form-control w-full flex-1">
            <div class="label">
              <span class="label-text text-sm">Title matcher</span>
            </div>
            <input v-model="currentRule.tab.title_matcher" class="input input-xs input-bordered w-full max-w-xs"
                   placeholder="Title matcher" required type="text"/>
            <div class="label">
            <span v-if="showHelp" class="text-xs label-text-alt">
              Regular expression to search string fragments in title (read the help section)</span>
            </div>
          </label>

          <label class="form-control w-full flex-1">
            <div class="label">
              <span class="label-text text-sm">URL matcher</span>
            </div>
            <input v-model="currentRule.tab.url_matcher" class="input input-xs input-bordered w-full max-w-xs"
                   placeholder="URL matcher" required type="text"/>
            <div class="label">
            <span v-if="showHelp" class="text-xs label-text-alt">
              Regular expression to search string fragments in URL (read the help section)</span>
            </div>
          </label>
        </div>
      </details>
    </div>

    <div class="modal-action items-center">
      <p v-if="showHelp" class="py-4">Remember refresh your tabs after saving</p>
      <form method="dialog">
        <button class="btn btn-sm">Close <kbd v-if="showHelp" class="kbd kbd-xs">esc</kbd></button>
      </form>
      <button class="btn btn-sm btn-outline btn-primary ml-4 group" @click="save">
        Save
        <span v-if="showHelp">
          <kbd class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary">⌘</kbd><kbd
            class="kbd kbd-xs group-hover:text-neutral group-hover:bg-primary">S</kbd>
        </span>
      </button>
    </div>
</template>
<script lang="ts" setup>
import {useRulesStore} from "../../../../../stores/rules.store.ts";
import {computed, inject, ref, watch} from "vue";
import CustomSelect from "../../../../global/CustomSelect.vue";
import NewFeature from "../../../../global/NewFeature.vue";
import {_clone} from "../../../../../helpers.ts";
import {GLOBAL_EVENTS, Group} from "../../../../../types.ts";

const rulesStore = useRulesStore();

const isEditMode = computed(() => !!rulesStore.currentRule);

const defaultRule = {
  name: "",
  detection: "CONTAINS",
  url_fragment: "",
  tab: {
    icon: "",
    muted: false,
    pinned: false,
    protected: false,
    title: "",
    title_matcher: null,
    unique: false,
    url_matcher: null,
    group: null,
    group_id: null,
  },
};

const newGroup = ref('');
const customIcon = ref('');
const iconUrl = ref('');

const showHelp = ref(false);

const currentRule = ref(_clone(rulesStore.currentRule ?? defaultRule));

const isFirstPartFilled = computed(() => {
  return currentRule.value.name && currentRule.value.detection && currentRule.value.url_fragment;
});

const availableGroups = rulesStore.groups.map((group: Group) => {
  return {
    icon: null,
    value: group.id,
    label: group.title,
  };
});

watch(
    () => rulesStore.currentRule,
    (newRule) => {
      currentRule.value = newRule ?? defaultRule;
    }
);

watch(
    () => customIcon.value,
    (newIcon) => {
      if (newIcon) {
        currentRule.value.tab.icon = newIcon;
      }
    }
);

watch(
    () => currentRule.value.tab.icon,
    (newIcon) => {
      if (newIcon.startsWith('http')) {
        iconUrl.value = newIcon;

        return;
      }

      iconUrl.value = chrome.runtime.getURL('/assets/' + newIcon);
      customIcon.value = '';
    }
);

watch(
    () => currentRule.value.tab.group_id,
    (newGroupId) => {
      if (newGroupId) {
        currentRule.value.tab.pinned = false;
      }
    }
);

const emitter = inject('emitter');
const save = async () => {
  if (isEditMode.value) {
    await rulesStore.updateRule(currentRule.value);
  } else {
    await rulesStore.addRule(currentRule.value);
  }

  emitter.emit(GLOBAL_EVENTS.CLOSE_ADD_RULE_MODAL);
};

const detections = [
  {name: "Contains", value: "CONTAINS"},
  {name: "Starts with", value: "STARTS_WITH"},
  {name: "Exact", value: "EXACT"},
  {name: "Ends with", value: "ENDS_WITH"},
  {name: "Regex", value: "REGEX"},
];

const assets = chrome.runtime.getURL('/assets/');

const icons = [
  {label: "Default", value: "chrome/default.png", icon: assets + "chrome/default.png"},
  {label: "Chrome", value: "chrome/chrome.png", icon: assets + "chrome/chrome.png"},
  {label: "Bookmarks", value: "chrome/bookmarks.png", icon: assets + "chrome/bookmarks.png"},
  {label: "Downloads", value: "chrome/downloads.png", icon: assets + "chrome/downloads.png"},
  {label: "Extensions", value: "chrome/extensions.png", icon: assets + "chrome/extensions.png"},
  {label: "History", value: "chrome/history.png", icon: assets + "chrome/history.png"},
  {label: "Settings", value: "chrome/settings.png", icon: assets + "chrome/settings.png"},
  {label: "amber", value: "bullets/bullet-amber.png", icon: assets + "bullets/bullet-amber.png"},
  {label: "amber-alt", value: "bullets/bullet-amber-alt.png", icon: assets + "bullets/bullet-amber-alt.png"},
  {label: "blue", value: "bullets/bullet-blue.png", icon: assets + "bullets/bullet-blue.png"},
  {label: "blue-alt", value: "bullets/bullet-blue-alt.png", icon: assets + "bullets/bullet-blue-alt.png"},
  {label: "blue-grey", value: "bullets/bullet-blue-grey.png", icon: assets + "bullets/bullet-blue-grey.png"},
  {label: "blue-grey-alt", value: "bullets/bullet-blue-grey-alt.png", icon: assets + "bullets/bullet-blue-grey-alt.png"},
  {label: "cyan", value: "bullets/bullet-cyan.png", icon: assets + "bullets/bullet-cyan.png"},
  {label: "cyan-alt", value: "bullets/bullet-cyan-alt.png", icon: assets + "bullets/bullet-cyan-alt.png"},
  {label: "deep-orange", value: "bullets/bullet-deep-orange.png", icon: assets + "bullets/bullet-deep-orange.png"},
  {label: "deep-orange-alt", value: "bullets/bullet-deep-orange-alt.png", icon: assets + "bullets/bullet-deep-orange-alt.png"},
  {label: "green", value: "bullets/bullet-green.png", icon: assets + "bullets/bullet-green.png"},
  {label: "green-alt", value: "bullets/bullet-green-alt.png", icon: assets + "bullets/bullet-green-alt.png"},
  {label: "indigo", value: "bullets/bullet-indigo.png", icon: assets + "bullets/bullet-indigo.png"},
  {label: "indigo-alt", value: "bullets/bullet-indigo-alt.png", icon: assets + "bullets/bullet-indigo-alt.png"},
  {label: "pink", value: "bullets/bullet-pink.png", icon: assets + "bullets/bullet-pink.png"},
  {label: "pink-alt", value: "bullets/bullet-pink-alt.png", icon: assets + "bullets/bullet-pink-alt.png"},
  {label: "purple", value: "bullets/bullet-purple.png", icon: assets + "bullets/bullet-purple.png"},
  {label: "purple-alt", value: "bullets/bullet-purple-alt.png", icon: assets + "bullets/bullet-purple-alt.png"},
  {label: "red", value: "bullets/bullet-red.png", icon: assets + "bullets/bullet-red.png"},
  {label: "red-alt", value: "bullets/bullet-red-alt.png", icon: assets + "bullets/bullet-red-alt.png"},
  {label: "teal", value: "bullets/bullet-teal.png", icon: assets + "bullets/bullet-teal.png"},
  {label: "teal-alt", value: "bullets/bullet-teal-alt.png", icon: assets + "bullets/bullet-teal-alt.png"},
];

</script>
