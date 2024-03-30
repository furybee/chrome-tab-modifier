<template>
	<ul class="menu p-4 w-80 bg-base-300 text-base-content">
		<li v-for="menuItem in props.menuItems" :key="menuItem.component">
			<a @click.prevent="onMenuClicked(menuItem)">
				<component :is="icons[menuItem.icon]" class="menuItem-icon" />
				{{ menuItem.title }}
				<template v-if="menuItem.component === 'TabGroupsPane'">
					<NewFeature />
				</template>
			</a>
		</li>
	</ul>
</template>

<script lang="ts" setup>
import { MenuItem } from '../../../common/types.ts';
import TabRulesIcon from '../../icons/TabRulesIcon.vue';
import TabGroupsIcon from '../../icons/TabGroupsIcon.vue';
import SettingsIcon from '../../icons/SettingsIcon.vue';
import HelpIcon from '../../icons/HelpIcon.vue';
import GithubIcon from '../../icons/GithubIcon.vue';
import DonationIcon from '../../icons/DonationIcon.vue';
import ChromeIcon from '../../icons/ChromeIcon.vue';
import NewFeature from '../../global/NewFeature.vue';

const icons = {
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

const emit = defineEmits(['onMenuClicked']);

const onMenuClicked = (menu: MenuItem) => {
	if (menu.link) return window.open(menu.link, '_blank');

	emit('onMenuClicked', menu);
};
</script>

<style lang="scss" scoped></style>
