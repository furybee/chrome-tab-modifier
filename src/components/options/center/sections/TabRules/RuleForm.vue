<template>
  <div class="modal-box w-11/12 max-w-5xl">
    <h3 class="font-bold text-lg flex justify-between">
      <span v-if="isEditMode">Edit rule</span>
      <span v-else>Add a new rule</span>

      <label class="btn btn-xs btn-circle bg-transparent border-none swap swap-rotate">
        <input v-model="showHelp" type="checkbox" />
        <svg class="swap-off w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <svg class="swap-on w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </label>
    </h3>

    <div class="flex gap-2">
      <label class="form-control w-full max-w-xs flex-1">
        <div class="label">
          <span class="label-text text-xs">Name</span>
        </div>
        <input v-model="currentRule.name" class="input input-xs input-bordered w-full max-w-xs" placeholder="e.g. Pinned GMail" required type="text" />
        <div v-if="showHelp" class="label">
          <span class="text-xs label-text-alt">Give an explicit name, just for you</span>
        </div>
      </label>

      <label class="form-control w-full max-w-xs flex-0">
        <div class="label">
          <span class="label-text text-xs">Detection</span>
        </div>
        <select v-model="currentRule.detection" class="select select-xs select-bordered">
          <option v-for="(detection, index) in detections" :key="index" :value="detection.value">
            {{ detection.name }}
          </option>
        </select>
      </label>

      <label class="form-control w-full max-w-xs flex-1">
        <div class="label">
          <span class="label-text text-xs">URL Fragment</span>
        </div>
        <input v-model="currentRule.url_fragment" class="input input-xs input-bordered w-full max-w-xs" placeholder="e.g mail.google.com" required type="text" />
        <div v-if="showHelp" class="label">
          <span class="text-xs label-text-alt">URL fragment to find</span>
        </div>
      </label>
    </div>

    <div v-if="isFirstPartFilled" class="mt-4">
      <p class="text-accent">The following actions will be applied when the URL contains {{ currentRule.url_fragment }}:</p>

      <label class="form-control w-full flex-1 mt-4">
        <div class="label">
          <span class="label-text text-xs">Tab Title</span>
        </div>
        <input v-model="currentRule.tab.title" class="input input-xs input-bordered w-full" placeholder="e.g. Hey {title}" required type="text" />
        <div class="label">
        <span v-if="showHelp" class="text-xs label-text-alt">
          You can inject any DOM content with {selector}. Examples: {title} for website title, {h1}, {#id}, {.class}, etc. (Read the help section)
        </span>
        </div>
      </label>

      <div class="flex gap-2">
        <label class="form-control w-full max-w-xs flex-0">
          <div class="label">
            <span class="label-text text-xs">Icon</span>
          </div>
          <select v-model="currentRule.tab.icon" class="select select-xs select-bordered">
            <option v-for="(icon, index) in icons" :key="index" :value="icon.value">
              {{ icon.name }}
            </option>
          </select>
        </label>

        <label class="form-control w-full flex-1">
          <div class="label">
            <span class="label-text text-xs">Custom Icon</span>
          </div>
          <input v-model="currentRule.tab.icon" class="input input-xs input-bordered w-full" placeholder="e.g. https://google.com/favicon.ico" required type="text" />
          <div v-if="showHelp" class="label">
            <span class="text-xs label-text-alt">You can set a custom URL or data URI for the new icon, no local path accepted</span>
          </div>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Pinned</span>
            <input v-model="currentRule.tab.pinned" checked class="toggle toggle-sm toggle-accent" type="checkbox" />
          </label>
        </div>
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Ask before closing</span>
            <input v-model="currentRule.tab.protected" checked class="toggle toggle-sm toggle-accent" type="checkbox" />
          </label>
        </div>
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Unique</span>
            <input v-model="currentRule.tab.unique" checked class="toggle toggle-sm toggle-accent" type="checkbox" />
          </label>
        </div>
        <div class="form-control w-52">
          <label class="cursor-pointer label">
            <span class="label-text text-xs">Muted</span>
            <input v-model="currentRule.tab.muted" checked class="toggle toggle-sm toggle-accent" type="checkbox" />
          </label>
        </div>
      </div>

      <div class="flex gap-2">
        <label class="form-control w-full flex-1">
          <div class="label">
            <span class="label-text text-xs">Title matcher</span>
          </div>
          <input v-model="currentRule.tab.title_matcher" class="input input-xs input-bordered w-full max-w-xs" placeholder="Title matcher" required type="text" />
          <div class="label">
            <span v-if="showHelp" class="text-xs label-text-alt">Regular expression to search string fragments in title
(read the help section)</span>
          </div>
        </label>

        <label class="form-control w-full flex-1">
          <div class="label">
            <span class="label-text text-xs">URL matcher</span>
          </div>
          <input v-model="currentRule.tab.url_matcher" class="input input-xs input-bordered w-full max-w-xs" placeholder="URL matcher" required type="text" />
          <div class="label">
            <span v-if="showHelp" class="text-xs label-text-alt">Regular expression to search string fragments in URL
(read the help section)</span>
          </div>
        </label>
      </div>
    </div>

<!--    <pre>{{ currentRule }}</pre>-->
<!--    <pre>{{ rulesStore.currentRule }}</pre>-->

    <div class="modal-action">
      <p class="py-4">Press ESC key or </p>
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRulesStore } from "../../../../../stores/rules.store.ts";
import { computed, ref, watch } from "vue";

const rulesStore = useRulesStore();

const isEditMode = computed(() => !!rulesStore.currentRule);

let defaultRule = {
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
  },
};

if (rulesStore.currentRule) {
  defaultRule = { ...rulesStore.currentRule };
}

const showHelp = ref(false);

const currentRule = ref(defaultRule);

const isFirstPartFilled = computed(() => {
  return currentRule.value.name && currentRule.value.detection && currentRule.value.url_fragment;
});


watch(
    () => rulesStore.currentRule,
    (newRule) => {
      currentRule.value = newRule ?? defaultRule;
    }
);

const handleSubmit = () => {
  if (isEditMode.value) {
    rulesStore.updateRule(currentRule.value);
  } else {
    rulesStore.addRule(currentRule.value);
  }
};

const detections = [
  { name: "Contains", value: "CONTAINS" },
  { name: "Starts with", value: "STARTS_WITH" },
  { name: "Exact", value: "EXACT" },
  { name: "Ends with", value: "ENDS_WITH" },
  { name: "Regex", value: "REGEX" },
];

const icons = [
  { name: "Chrome", value: "chrome/chrome.png", type: "internal" },
  { name: "Bookmarks", value: "chrome/bookmarks.png", type: "internal" },
  { name: "Downloads", value: "chrome/downloads.png", type: "internal" },
  { name: "Extensions", value: "chrome/extensions.png", type: "internal" },
  { name: "History", value: "chrome/history.png", type: "internal" },
  { name: "New Tab", value: "chrome/newtab.png", type: "internal" },
  { name: "Settings", value: "chrome/settings.png", type: "internal" },
  { name: "Web Store", value: "chrome/webstore.png", type: "internal" },
];

</script>
