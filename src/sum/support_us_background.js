export const LIST_MAX_AGE = 5 * 24 * 60 * 60 * 1000;
export let wList = {};
export let wListDate = 0;
export let loading = true;

export function getTUrl(url) {
	try {
		if (!url) return '';

		const a = new URL(url);
		return a.hostname.replace(/^www\./, '');
	} catch (error) {
		return '';
	}
}

function loadLocalList(callback) {
	const localFilePath = 'sum/wlist.json';
	fetch(chrome.runtime.getURL(localFilePath))
		.then((response) => response.json())
		.then((data) => {
			wList = {};
			for (const val of data) {
				wList[getTUrl(val.m)] = {};
			}

			chrome.storage.local.set({ wList, wListDate: new Date().getTime() }, () => {
				console.log('List loaded from local file');
				if (callback) callback();
			});
		})
		.catch((error) => {
			console.error('Failed to load  list from LOCAL file', error);
			if (callback) callback();
		});
}

export function initialize() {
	if (typeof chrome.action === 'undefined') {
		chrome.action = chrome.browserAction;
	}

	chrome.permissions.contains(
		{
			permissions: ['storage'],
		},
		(result) => {
			if (result) {
				console.log('bg:hasEnough permissions');

				console.log('support us initialized');

				chrome.storage.local.get(['wList', 'wListDate'], (value) => {
					wList = value.wList || {};
					wListDate = value.wListDate || 0;

					if (wListDate < new Date().getTime() - LIST_MAX_AGE) {
						console.log('loading list...');

						loadLocalList(() => {
							loading = false;
						});
					} else {
						console.log('list loaded from cache');

						loading = false;
					}
				});

				chrome.runtime.onMessage.addListener((req, sender, rcb) => {
					if (req.action === 'w_list') {
						if (loading) {
							rcb({ status: 'loading' });
						} else {
							rcb({ status: 'loaded', wList, extensionId: chrome.runtime.id });
						}
					}

					// return true;
				});

				//for manage settings page
				chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
					if (request.permAction === 'checkIfHasEnough') {
						//console.log('bg:request.permAction:checkIfHasEnough');
						chrome.permissions.contains(
							{
								permissions: ['storage'],
							},
							(result) => {
								if (result) {
									// The extension has the permissions.
									sendResponse({ permStatus: true });
									//console.log("bg:redirectcheck asked perm:hasEnough permissions 1");
								} else {
									// The extension doesn't have the permissions.
									sendResponse({ permStatus: false });
									//console.log("bg:redirectcheck asked perm:hasNotEnough permissions 1");
								}
							}
						);
					}
					//else if (request.tabAction === "openNewTab"){

					//   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
					//      if (request.tabAction === "openNewTab") {
					//         chrome.tabs.create({
					//           url: request.url,
					//           active: false
					//         });
					//      }
					//   });

					// }
				});
				//----------
			} else {
				console.log('bg:hasNotEnough permissions');

				//------------------  SUPPORT MODE INFO LISTENERS  -----------------------
				chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
					if (request.permAction === 'checkIfHasEnough') {
						chrome.permissions.contains(
							{
								permissions: ['storage'],
								//origins: ["https://*/*","http://*/*"],
							},
							(result) => {
								if (result) {
									// The extension has the permissions.
									sendResponse({ permStatus: true });
									//console.log("bg:redirectcheck asked perm:hasEnough permissions 2");
								} else {
									// The extension doesn't have the permissions.
									sendResponse({ permStatus: false });
									//console.log("bg:redirectcheck asked perm:hasNotEnough permissions 2");
								}
							}
						);
					} else if (request.permAction === 'getPerm') {
						chrome.permissions.request(
							{
								permissions: ['storage'],
							},
							(granted) => {
								if (granted) {
									sendResponse({ displaySuccessPopin: true });
									console.log('redirectcheck:permissions granted');

									initialize();
								}
							}
						);
					} else if (request.permAction === 'refusePerm') {
						// displayPermissions();
					} else if (request.permAction === 'getExtensionId') {
						sendResponse({ extensionId: chrome.runtime.id });
					}

					// return true;
				});
				//------------END SUPPORT MODE LISTENERS--------------------------------------
			}
		}
	);
}
