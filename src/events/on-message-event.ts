import { ACTION } from '../common/const.ts';
import { handleSetUnique } from '../handlers/set-unique.ts';
import { handleSetPinned } from '../handlers/set-pinned.ts';
import { handleSetProtected } from '../handlers/set-protected.ts';
import { handleSetGroup } from '../handlers/set-group.ts';
import { handleSetMuted } from '../handlers/set-muted.ts';
import { handleRenameTab } from '../handlers/rename-tab.ts';

export function registerOnMessageEvent() {
	chrome.runtime.onMessage.addListener(async (message, sender) => {
		if (!sender.tab) return;

		const tab = sender.tab as chrome.tabs.Tab;
		if (!tab.id) return;

		switch (message.action) {
			case ACTION.SET_UNIQUE:
				await handleSetUnique(message, tab);
				break;
			case ACTION.SET_PINNED:
				await handleSetPinned(tab, { pinned: true });
				break;
			case ACTION.SET_PROTECTED:
				await handleSetProtected(tab);
				break;
			case ACTION.SET_GROUP:
				await handleSetGroup(message.rule, tab);
				break;
			case ACTION.SET_MUTED:
				await handleSetMuted(tab, { muted: true });
				break;
			case ACTION.RENAME_TAB:
				await handleRenameTab(tab, message.title);
				break;
		}
	});
}
