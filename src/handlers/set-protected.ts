/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
 * Require sticky activation for the dialog to be displayed.
 * In other words, the browser will only show the dialog box if the
 * frame or any embedded frame receives a user gesture or user interaction.
 * If the user has never interacted with the page, then there is no user data to save,
 * so no legitimate use case for the dialog.
 */

export async function handleSetProtected(tab: chrome.tabs.Tab) {
	if (!tab.id) return;

	await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: () => {
			let removeListener = false;

			const bindBeforeUnload = () => {
				window.addEventListener('beforeunload', function (e) {
					e.preventDefault();
					e.returnValue = true;

					return 'Are you sure?';
				});

				if (removeListener) {
					window.removeEventListener('click', bindBeforeUnload);
					window.removeEventListener('mousedown', bindBeforeUnload);
					window.removeEventListener('keydown', bindBeforeUnload);
					window.removeEventListener('pointerdown', bindBeforeUnload);
					window.removeEventListener('pointerup', bindBeforeUnload);
					window.removeEventListener('touchend', bindBeforeUnload);
				}
			};

			bindBeforeUnload();

			removeListener = true;
			window.removeEventListener('click', bindBeforeUnload);
			window.removeEventListener('mousedown', bindBeforeUnload);
			window.removeEventListener('keydown', bindBeforeUnload);
			window.removeEventListener('pointerdown', bindBeforeUnload);
			window.removeEventListener('pointerup', bindBeforeUnload);
			window.removeEventListener('touchend', bindBeforeUnload);
		},
	});
}
