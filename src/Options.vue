<template>
  <div class="flex h-screen w-screen overflow-auto">
    <div class="w-[350px] bg-base-300 p-4 flex flex-col gap-4">
      <Menu :menuItems="sectionItems" title="Sections" @onMenuClicked="onMenuClicked"/>

      <Menu :menuItems="resourceItems" title="Resources" @onMenuClicked="onMenuClicked"/>
    </div>
    <div class="w-full overflow-auto">
      <div class="navbar bg-base-200">
        <div class="navbar-start">
          <a class="btn btn-ghost text-xl">
            {{ currentContent.title }}
          </a>
        </div>

        <div class="navbar-end">
          <a
              v-if="currentContent.component === 'TabRulesPane'"
              class="btn"
              @click="openAddModal">
            Add
          </a>
        </div>
      </div>

      <component :is="panes[currentContent.component]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Menu from "./components/options/left/Menu.vue";
import {GLOBAL_EVENTS, MenuItem} from "./types.ts";
import {inject, ref} from "vue";
import TabRulesPane from "./components/options/center/sections/TabRulesPane.vue";
import SettingsPane from "./components/options/center/sections/SettingsPane.vue";
import HelpPane from "./components/options/center/sections/HelpPane.vue";
import DonationPane from "./components/options/center/resources/DonationPane.vue";

const emitter = inject('emitter');

const panes = {
  TabRulesPane,
  SettingsPane,
  HelpPane,
  DonationPane,
};

const sectionItems = [
  {
    title: 'Tab Rules',
    icon: 'TabRulesIcon',
    component: 'TabRulesPane',
  },
  {
    title: 'Settings',
    icon: 'SettingsIcon',
    component: 'SettingsPane'
  },
  {
    title: 'Help',
    icon: 'HelpIcon',
    component: 'HelpPane'
  }
] as MenuItem[];

const resourceItems = [
  {
    title: 'Chrome Web Store',
    icon: 'ChromeIcon',
    link: 'https://chrome.google.com/webstore/detail/tab-modifier/hcbgadmbdkiilgpifjgcakjehmafcjai',
  },
  {
    title: 'GitHub',
    icon: 'GithubIcon',
    link: 'https://github.com/furybee/chrome-tab-modifier'
  },
  {
    title: 'Donate',
    icon: 'DonationIcon',
    component: 'DonationPane'
  },
] as MenuItem[]

const currentContent = ref<MenuItem>(sectionItems[0]);

const onMenuClicked = (menuItem: MenuItem) => {
  currentContent.value = menuItem;
};

const openAddModal = () => {
  emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL)
};
</script>

<style lang="scss" scoped>

</style>
