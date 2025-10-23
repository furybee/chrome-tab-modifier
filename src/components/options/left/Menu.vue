<template>
	<ul class="menu p-4 w-80 bg-base-300 text-base-content">
		<li v-for="menuItem in props.menuItems" :key="menuItem.component">
			<a
				:class="{
					active: menuStore.currentMenuItem?.title === menuItem.title,
				}"
				@click.prevent="onMenuClicked(menuItem)"
			>
				<span class="text-xl">{{ menuItem.emoji }}</span>
				{{ menuItem.title }}
				<template v-if="menuItem.link">
					<ExternalIcon class="!w-3 !h-3" />
				</template>
			</a>
		</li>
	</ul>
</template>

<script lang="ts" setup>
import { MenuItem } from '../../../common/types.ts';
import ExternalIcon from '../../icons/ExternalIcon.vue';
import { useMenuStore } from '../../../stores/menu.store.ts';

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
