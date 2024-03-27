<template>
  <div class="container mx-auto max-w-5xl p-4">
    <div class="card bg-base-200">
      <div class="card-body">
        <h2 class="card-title">General</h2>

        <div class="grid grid-cols-6">
          <div class="col-span-5">
            <h3 class="font-bold">Theme -
              <NewFeature/>
            </h3>
            <p>Change Tab Modifier theme</p>
          </div>
          <div class="col-span-1">
            <CustomSelect v-model="currentTheme" :items="themes"/>
          </div>
        </div>

        <div class="grid grid-cols-6 mt-4">
          <div class="col-span-5">
            <h3 class="font-bold">Notifications</h3>
            <p>Enable "New version" toast, a tab is opened on each new version with a link to the changelog</p>
          </div>
          <div class="col-span-1">
            <input checked class="toggle toggle-primary" type="checkbox"/>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-200 mt-4">
      <div class="card-body">
        <h2 class="card-title">Backup</h2>

        <div class="grid grid-cols-6">
          <div class="col-span-5">
            <h3 class="font-bold">Import tab rules</h3>
            <p>Restore your tab rules settings from an external JSON file.</p>
          </div>
          <div class="col-span-1">
            <button class="btn btn-sm btn-outline w-full">Import</button>
          </div>
        </div>

        <div class="grid grid-cols-6 mt-4">
          <div class="col-span-5">
            <h3 class="font-bold">Export tab rules</h3>
            <p>Export your tab rules for backup purpose or for sharing with friend.</p>
          </div>
          <div class="col-span-1">
            <button class="btn btn-sm btn-outline w-full">Export</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-200 border border-error mt-4">
      <div class="card-body">
        <h2 class="card-title text-error">Danger zone</h2>

        <div class="grid grid-cols-6">
          <div class="col-span-5">
            <h3 class="font-bold">Delete all rules</h3>
            <p>Once you delete all rules, there is no going back except from backup. Please be certain.</p>
          </div>
          <div class="col-span-1">
            <button class="btn btn-sm btn-error btn-outline w-full" @click="onDeleteAllRules">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import CustomSelect from "../../../global/CustomSelect.vue";
import {ref, watch} from "vue";
import {useRulesStore} from "../../../../stores/rules.store.ts";
import NewFeature from "../../../global/NewFeature.vue";

const rulesStore = useRulesStore();

const themes = [
  {label: 'Dim', value: 'dim'},
  {label: 'Dark', value: 'dark'},
  {label: 'Light', value: 'light'},
  {label: 'Cupcake', value: 'cupcake'},
];

const currentTheme = ref(rulesStore.theme);

watch(currentTheme, (theme) => {
  rulesStore.setTheme(theme);
});

const onDeleteAllRules = async () => {
  console.log('onDeleteAllRules');

  await rulesStore.deleteAllRules();
};

</script>

<style scoped>

</style>
