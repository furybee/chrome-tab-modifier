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

						<div class="navbar-end">
							<a
								v-if="currentContent.component === 'TabRulesPane'"
								class="btn"
								@click="openAddModal"
							>
								Add
							</a>
							<a
								v-if="currentContent.component === 'TabGroupsPane'"
								class="btn"
								@click="openAddGroupModal"
							>
								Add
							</a>
						</div>
					</div>

					<component :is="panes[currentContent.component]" />
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
import { GLOBAL_EVENTS, MenuItem } from './types.ts';
import { inject, onMounted, ref } from 'vue';
import TabRulesPane from './components/options/center/sections/TabRulesPane.vue';
import TabGroupsPane from './components/options/center/sections/TabGroupsPane.vue';
import SettingsPane from './components/options/center/sections/SettingsPane.vue';
import HelpPane from './components/options/center/sections/HelpPane.vue';
import DonationPane from './components/options/center/resources/DonationPane.vue';
import BurgerIcon from './icons/BurgerIcon.vue';
import CloseIcon from './icons/CloseIcon.vue';
import { useRulesStore } from './stores/rules.store.ts';

const emitter = inject('emitter');

const panes = {
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

const currentContent = ref<MenuItem>(sectionItems[0]);

const onMenuClicked = (menuItem: MenuItem) => {
	currentContent.value = menuItem;

	const drawerMenu = document.getElementById('drawer-menu') as HTMLInputElement;
	drawerMenu.checked = false;
};

const openAddModal = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL);
};

const openAddGroupModal = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_GROUP_MODAL);
};

onMounted(async () => {
	await rulesStore.init();

	await rulesStore.setTheme(rulesStore.theme);

	// const createTabProperties = {
	//     url: 'options.html',
	//     active: false,
	// };

	// chrome.tabs.create(createTabProperties, (tab) => {
	//     console.log(tab);
	//
	//     const createGroupProperties = {
	//       tabIds: [tab.id],
	//     };
	//
	//     chrome.tabs.group(createGroupProperties, (groupId: number) => {
	//       console.log(groupId);
	//
	//       chrome.tabGroups.update(
	//           groupId,
	//           {
	//             title: 'Tab Modifier',
	//             color: 'red',
	//             collapsed: true,
	//           },
	//           () => {
	//             console.log('Tab group updated');
	//           }
	//     )
	//     });
	// });
});
</script>

<style lang="scss" scoped></style>
