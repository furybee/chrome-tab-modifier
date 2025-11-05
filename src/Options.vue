<template>
	<div class="flex h-screen w-screen overflow-hidden">
		<div class="drawer lg:drawer-open overflow-hidden">
			<input id="drawer-menu" class="drawer-toggle" type="checkbox" />
			<div class="drawer-content flex flex-col items-center justify-center overflow-auto relative">
				<div class="absolute inset-0 opacity-10 pointer-events-none">
					<div class="pattern-background"></div>
				</div>
				<div class="h-screen w-full relative z-10">
					<div class="navbar bg-base-200">
						<div class="navbar-start flex-col items-start gap-0">
							<div class="flex items-center w-full">
								<label
									class="btn btn-circle swap swap-rotate drawer-button lg:hidden"
									for="drawer-menu"
								>
									<input type="checkbox" />
									<BurgerIcon />
									<CloseIcon />
								</label>

								<div class="ml-4">
									<h1 class="text-lg font-semibold">
										{{ currentContent.title }}
									</h1>
									<p v-if="currentContent.description" class="text-xs text-base-content/60">
										{{ currentContent.description }}
									</p>
								</div>
							</div>
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
					<div class="px-8 pt-4">
						<h1 class="text-xl font-bold flex items-center gap-2">
							<img src="/assets/icon_32.png" alt="Tabee icon" class="w-5 h-5" />
							Tabee
						</h1>
						<p class="text-xs text-base-content/70 mt-1">The original Tab Modifier.</p>
					</div>

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
import TabHivePane from './components/options/center/sections/TabHivePane.vue';
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
	TabHivePane,
	SettingsPane,
	HelpPane,
	DonationPane,
};

const sectionItems = [
	{
		title: 'Rules',
		emoji: '📋',
		description: 'Customize tabs based on URL patterns',
		component: 'TabRulesPane',
	},
	{
		title: 'Groups',
		emoji: '🗂️',
		description: 'Organize your tabs with custom groups',
		component: 'TabGroupsPane',
	},
	{
		title: 'Tab Hive',
		emoji: '🍯',
		description: 'Manage closed tabs and auto-close settings',
		component: 'TabHivePane',
	},
	{
		title: 'Settings',
		emoji: '⚙️',
		description: 'Configure performance and preferences',
		component: 'SettingsPane',
	},
	{
		title: 'Help',
		emoji: '❓',
		description: 'Learn how to use Tabee features',
		component: 'HelpPane',
	},
] as MenuItem[];

const resourceItems = [
	{
		title: 'Chrome Web Store',
		emoji: '🌐',
		link: 'https://chrome.google.com/webstore/detail/tab-modifier/penegkenfmliefdbmnfkidlgjfjcidia',
	},
	{
		title: 'GitHub',
		emoji: '💻',
		link: 'https://github.com/furybee/chrome-tab-modifier',
	},
	{
		title: 'Donate',
		emoji: '💝',
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

	emitter.on(GLOBAL_EVENTS.NAVIGATE_TO_SETTINGS, () => {
		onMenuClicked(sectionItems.find((item) => item.component === 'SettingsPane')!);
	});
});
</script>

<style scoped>
.pattern-background {
	width: 100%;
	height: 100%;
	background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
	background-size: 32px 32px;
}
</style>
