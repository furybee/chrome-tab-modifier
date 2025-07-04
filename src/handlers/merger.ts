const TARGET_WINDOW_TYPE = 'normal' satisfies chrome.windows.windowTypeEnum;

/**
 * Vérifie si une fenêtre correspond à un type spécifique (normal/incognito).
 */
const isTargetWindow = <T extends boolean>(
	win: chrome.windows.Window,
	{ incognito }: { incognito: T }
): win is chrome.windows.Window & { incognito: T; type: typeof TARGET_WINDOW_TYPE } =>
	win.incognito === incognito && win.type === TARGET_WINDOW_TYPE;

/**
 * Déplace les onglets vers une fenêtre cible.
 * Les onglets groupés sont déplacés via leur groupId.
 */
const moveTabsToWindow = async (tabs: chrome.tabs.Tab[], targetWindowId: number): Promise<void> => {
	const moveProps = { windowId: targetWindowId, index: -1 };

	const groupedTabs = tabs.filter((tab) => tab.groupId > 0);
	const groupIds = [...new Set(groupedTabs.map((tab) => tab.groupId))];

	await Promise.all(groupIds.map((id) => chrome.tabGroups.move(id, moveProps)));

	const groupedIds = new Set(groupedTabs.map((tab) => tab.id));
	const ungroupedTabIds = tabs
		.filter((tab) => !groupedIds.has(tab.id))
		.map((tab) => tab.id)
		.filter((id): id is number => id !== undefined);

	if (ungroupedTabIds.length) {
		await chrome.tabs.move(ungroupedTabIds, moveProps);
	}
};

/**
 * Réactive le "pinned" sur les onglets après un déplacement.
 */
const restorePinnedTabs = async (tabs: chrome.tabs.Tab[]) => {
	const pinnedTabIds = tabs
		.filter((tab) => tab.pinned && tab.id !== undefined)
		.map((tab) => tab.id!) as number[];

	await Promise.all(pinnedTabIds.map((id) => chrome.tabs.update(id, { pinned: true })));
};

/**
 * Fusionne plusieurs fenêtres en une seule.
 */
const mergeWindows = async (windows: chrome.windows.Window[]) => {
	if (windows.length <= 1) return;

	const [mainWindow, ...others] = windows;
	const targetId = mainWindow.id;
	if (!targetId) throw new Error('Main window has no ID.');

	for (const win of others) {
		if (!win.tabs) {
			throw new Error(`Window ${win.id} has no tabs.`);
		}

		await moveTabsToWindow(win.tabs, targetId);
		await restorePinnedTabs(win.tabs);
	}
};

/**
 * Fusionne toutes les fenêtres normales.
 */
const handleMergeNormalWindows = async () => {
	try {
		const windows = await chrome.windows.getAll({ populate: true });
		const normalWindows = windows.filter(
			(
				win
			): win is chrome.windows.Window & {
				incognito: false;
				type: typeof TARGET_WINDOW_TYPE;
			} => isTargetWindow(win, { incognito: false })
		);

		await mergeWindows(normalWindows);
	} catch (err) {
		console.error('Error merging normal windows:', err);
	}
};

/**
 * Fusionne toutes les fenêtres privées.
 */
const handleMergeIncognitoWindows = async () => {
	try {
		const windows = await chrome.windows.getAll({ populate: true });
		const incognitoWindows = windows.filter(
			(
				win
			): win is chrome.windows.Window & {
				incognito: true;
				type: typeof TARGET_WINDOW_TYPE;
			} => isTargetWindow(win, { incognito: true })
		);

		await mergeWindows(incognitoWindows);
	} catch (err) {
		console.error('Error merging incognito windows:', err);
	}
};

export { handleMergeNormalWindows, handleMergeIncognitoWindows };
