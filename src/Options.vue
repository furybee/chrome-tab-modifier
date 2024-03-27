<template>
  <div class="flex h-screen w-screen overflow-auto">
    <div class="drawer lg:drawer-open">
      <input id="drawer-menu" class="drawer-toggle" type="checkbox"/>
      <div class="drawer-content flex flex-col items-center justify-center">
        <div class="h-screen w-full">
          <div class="navbar bg-base-200">
            <div class="navbar-start">
              <label class="btn btn-circle swap swap-rotate drawer-button lg:hidden" for="drawer-menu">
                <input type="checkbox"/>
                <BurgerIcon/>
                <CloseIcon/>
              </label>

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

          <component :is="panes[currentContent.component]"/>
        </div>
      </div>
      <div class="drawer-side bg-base-300">
        <label aria-label="close sidebar" class="drawer-overlay" for="drawer-menu"></label>
        <Menu :menuItems="sectionItems" title="Sections" @onMenuClicked="onMenuClicked"/>

        <Menu :menuItems="resourceItems" title="Resources" @onMenuClicked="onMenuClicked"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Menu from "./components/options/left/Menu.vue";
import {GLOBAL_EVENTS, MenuItem} from "./types.ts";
import {inject, onMounted, ref} from "vue";
import TabRulesPane from "./components/options/center/sections/TabRulesPane.vue";
import SettingsPane from "./components/options/center/sections/SettingsPane.vue";
import HelpPane from "./components/options/center/sections/HelpPane.vue";
import DonationPane from "./components/options/center/resources/DonationPane.vue";
import BurgerIcon from "./icons/BurgerIcon.vue";
import CloseIcon from "./icons/CloseIcon.vue";
import {useRulesStore} from "./stores/rules.store.ts";

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

const rulesStore = useRulesStore();

const currentContent = ref<MenuItem>(sectionItems[0]);

const onMenuClicked = (menuItem: MenuItem) => {
  currentContent.value = menuItem;
};

const openAddModal = () => {
  emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL)
};

onMounted(async () => {
  await rulesStore.init();

  await rulesStore.setTheme(rulesStore.theme);
});
</script>

<style lang="scss" scoped>

</style>
