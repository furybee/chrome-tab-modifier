<template>
	<div class="flex h-screen w-screen overflow-hidden">
		<div class="drawer lg:drawer-open overflow-hidden">
			<input id="drawer-menu" class="drawer-toggle" type="checkbox" />
			<div class="drawer-content flex flex-col items-center justify-center overflow-auto">
				<div class="h-screen w-full">
					<div class="navbar bg-base-200">
						<div class="navbar-start">
							<label
								class="btn btn-circle swap swap-rotate drawer-button lg:hidden"
								for="drawer-menu"
							>
								<input type="checkbox" />
								<BurgerIcon />
								<CloseIcon />
							</label>

							<a class="btn btn-ghost text-xl">
								{{ currentContent.title }}
							</a>
						</div>

						<div class="navbar-end mr-2">
							<a
								v-if="hasRules && currentContent.component === 'TabRulesPane'"
								class="btn btn-xs btn-circle btn-primary"
								@click="openAddModal"
							>
								<PlusIcon class="!w-3 !h-3" />
							</a>
							<a
								v-if="hasGroups && currentContent.component === 'TabGroupsPane'"
								class="btn btn-xs btn-circle btn-primary"
								@click="openAddGroupModal"
							>
								<PlusIcon class="!w-3 !h-3" />
							</a>
						</div>
					</div>

					<component :is="panes[currentContent.component]" v-if="currentContent.component" />

					<Toaster />
				</div>
			</div>
			<div class="drawer-side">
				<label aria-label="close sidebar" class="drawer-overlay" for="drawer-menu" />

				<div class="h-full bg-base-300">
					<h1 class="px-8 pt-4 text-xl font-bold">Tab Modifier</h1>

					<Menu :menu-items="sectionItems" title="Sections" @on-menu-clicked="onMenuClicked" />

					<div class="divider divider-base-200 my-0" />

					<Menu :menu-items="resourceItems" title="Resources" @on-menu-clicked="onMenuClicked" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Menu from './components/options/left/Menu.vue';
import { Components, GLOBAL_EVENTS, MenuItem } from './common/types.ts';
import { computed, inject, onMounted, ref } from 'vue';
import TabRulesPane from './components/options/center/sections/TabRulesPane.vue';
import TabGroupsPane from './components/options/center/sections/TabGroupsPane.vue';
import SettingsPane from './components/options/center/sections/SettingsPane.vue';
import HelpPane from './components/options/center/sections/HelpPane.vue';
import DonationPane from './components/options/center/resources/DonationPane.vue';
import BurgerIcon from './components/icons/BurgerIcon.vue';
import CloseIcon from './components/icons/CloseIcon.vue';
import { useRulesStore } from './stores/rules.store.ts';
import Toaster from './components/global/Toaster.vue';
import PlusIcon from './components/icons/PlusIcon.vue';
import { useMenuStore } from './stores/menu.store.ts';

const emitter: any = inject('emitter');

const panes: Components = {
	TabRulesPane,
	TabGroupsPane,
	SettingsPane,
	HelpPane,
	DonationPane,
};

const sectionItems = [
	{
		title: 'Rules',
		icon: 'TabRulesIcon',
		component: 'TabRulesPane',
	},
	{
		title: 'Groups',
		icon: 'TabGroupsIcon',
		component: 'TabGroupsPane',
	},
	{
		title: 'Settings',
		icon: 'SettingsIcon',
		component: 'SettingsPane',
	},
	{
		title: 'Help',
		icon: 'HelpIcon',
		component: 'HelpPane',
	},
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
		link: 'https://github.com/furybee/chrome-tab-modifier',
	},
	{
		title: 'Donate',
		icon: 'DonationIcon',
		component: 'DonationPane',
	},
] as MenuItem[];

const rulesStore = useRulesStore();
const menuStore = useMenuStore();

const currentContent = ref<MenuItem>(sectionItems[0]);

const onMenuClicked = (menuItem: MenuItem) => {
	currentContent.value = menuItem;

	menuStore.setCurrentMenuItem(menuItem);

	const drawerMenu = document.getElementById('drawer-menu') as HTMLInputElement;
	drawerMenu.checked = false;
};

const openAddModal = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL);
};

const openAddGroupModal = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL);
};

const hasRules = computed<boolean>(() => {
	return rulesStore.rules.length > 0;
});

const hasGroups = computed<boolean>(() => {
	return rulesStore.groups.length > 0;
});

onMounted(async () => {
	menuStore.setCurrentMenuItem(currentContent.value);

	await rulesStore.init();
});
</script>

<style lang="scss" scoped></style>
