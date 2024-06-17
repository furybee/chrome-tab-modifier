import { defineStore } from 'pinia';
import { MenuItem } from '../common/types.ts';

export const useMenuStore = defineStore('menu', {
	state: () => {
		return {
			currentMenuItem: undefined as MenuItem | undefined,
		};
	},
	actions: {
		setCurrentMenuItem(menuItem: MenuItem) {
			this.currentMenuItem = menuItem;
		},
	},
});
