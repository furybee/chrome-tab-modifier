<template>
	<ul class="menu p-4 w-80 bg-base-300 text-base-content">
		<li v-for="menuItem in props.menuItems" :key="menuItem.component">
			<a
				:class="{
					active: menuStore.currentMenuItem?.title === menuItem.title,
				}"
				@click.prevent="onMenuClicked(menuItem)"
			>
				<component :is="icons[menuItem.icon]" class="menuItem-icon" />
				{{ menuItem.title }}
				<template v-if="menuItem.link">
					<ExternalIcon class="!w-3 !h-3" />
				</template>
			</a>
		</li>
	</ul>
</template>

<script lang="ts" setup>
import { Components, MenuItem } from '../../../common/types.ts';
import TabRulesIcon from '../../icons/TabRulesIcon.vue';
import TabGroupsIcon from '../../icons/TabGroupsIcon.vue';
import SettingsIcon from '../../icons/SettingsIcon.vue';
import HelpIcon from '../../icons/HelpIcon.vue';
import GithubIcon from '../../icons/GithubIcon.vue';
import DonationIcon from '../../icons/DonationIcon.vue';
import ChromeIcon from '../../icons/ChromeIcon.vue';
import ExternalIcon from '../../icons/ExternalIcon.vue';
import { useMenuStore } from '../../../stores/menu.store.ts';

const icons: Components = {
	TabRulesIcon,
	TabGroupsIcon,
	SettingsIcon,
	HelpIcon,
	GithubIcon,
	DonationIcon,
	ChromeIcon,
};

const props = defineProps<{
	title: string;
	menuItems: MenuItem[];
}>();

const menuStore = useMenuStore();

const emit = defineEmits(['onMenuClicked']);

const onMenuClicked = (menu: MenuItem) => {
	if (menu.link) return window.open(menu.link, '_blank');

	emit('onMenuClicked', menu);
};
</script>

<style lang="scss" scoped></style>
