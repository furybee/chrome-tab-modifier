import { _chromeGroupColor } from './common/helpers.ts';

let tabListContainer;
let searchInput;
let tabItemListContainer;
let currentIndex = -1;

export const initTabSpot = async () => {
	tabListContainer = createTabListContainer();
	searchInput = createSearchInput();
	tabItemListContainer = createTabItemListContainer();

	tabListContainer.appendChild(searchInput);
	tabListContainer.appendChild(tabItemListContainer);
	document.body.appendChild(tabListContainer);

	bindGlobalKeyEvents();
};

export const refreshResults = async (tabs) => {
	tabItemListContainer.innerHTML = '';

	if (tabs) {
		tabItemListContainer.style.display = 'block';

		tabs.forEach((tab) => {
			const tabItem = createTabItem(tab);

			tabItemListContainer.appendChild(tabItem);
		});

		document.body.appendChild(tabListContainer);

		highlightFoundItems();

		searchInput.focus();
	}
};

const highlightFoundItems = () => {
	const tabItems = tabItemListContainer.querySelectorAll('.tab-item');

	highlightSelectedItem(tabItems);
};

const highlightSelectedItem = (tabItems) => {
	tabItemListContainer.querySelectorAll('.tab-item').forEach((item) => {
		item.parentElement.style.backgroundColor = 'transparent';
	});

	currentIndex = currentIndex === -1 ? 0 : currentIndex;
	if (currentIndex >= 0 && currentIndex < tabItems.length) {
		tabItems[currentIndex].parentElement.style.backgroundColor = '#4f5d75';
		tabItems[currentIndex].parentElement.scrollIntoView({ block: 'nearest' });
	}
};

const createTabListContainer = () => {
	tabListContainer = document.createElement('div');
	tabListContainer.id = 'tab-list-container';
	tabListContainer.style.display = 'none';
	tabListContainer.style.backgroundColor = 'rgba(42, 48, 60, 0.95)';
	tabListContainer.style.color = 'white';
	tabListContainer.style.position = 'fixed';
	tabListContainer.style.top = '30%';
	tabListContainer.style.right = '0';
	tabListContainer.style.left = '0';
	tabListContainer.style.width = '100%';
	tabListContainer.style.maxWidth = '600px';
	tabListContainer.style.zIndex = '99999';
	tabListContainer.style.margin = '0 auto';
	tabListContainer.style.overflowY = 'auto';
	tabListContainer.style.overflowX = 'hidden';
	tabListContainer.style.maxHeight = '500px';
	tabListContainer.style.boxShadow = '0 0 10px rgba(42, 48, 60, 0.7)';
	tabListContainer.style.borderRadius = '15px';
	tabListContainer.style.fontFamily = 'Arial, sans-serif';
	tabListContainer.style.border = '1px solid #454f5b';

	return tabListContainer;
};

const createSearchInput = () => {
	searchInput = document.createElement('input');
	searchInput.type = 'search';
	searchInput.placeholder = 'Search tabs...';
	searchInput.style.width = '100%';
	searchInput.style.padding = '10px 16px';
	searchInput.style.fontFamily = 'Arial, sans-serif';
	searchInput.style.fontSize = '16px';
	searchInput.style.boxSizing = 'border-box';
	searchInput.style.outline = 'none';
	searchInput.style.backgroundColor = 'transparent';
	searchInput.style.border = 'none';
	searchInput.style.outline = 'none';
	searchInput.style.color = '#b3ccd6';

	searchInput.addEventListener('input', function () {
		const filter = searchInput.value.trim().toLowerCase();

		if (filter.length === 0) {
			tabItemListContainer.innerHTML = '';
			return;
		}

		setTimeout(async () => {
			await chrome.runtime.sendMessage({
				action: 'tabSpot:refresh',
				title: searchInput.value.trim().toLowerCase(),
			});
		});

		searchInput.focus();
	});

	searchInput.addEventListener('keydown', function (event) {
		const tabItems = Array.from(tabItemListContainer.querySelectorAll('.tab-item'));

		if (tabItems.length === 0) {
			currentIndex = -1;
			tabItemListContainer.innerHTML = '';

			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			currentIndex = (currentIndex + 1) % tabItems.length;

			highlightSelectedItem(tabItems);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			currentIndex = (currentIndex - 1 + tabItems.length) % tabItems.length;

			highlightSelectedItem(tabItems);
		} else if (event.key === 'Enter') {
			event.preventDefault();

			if (currentIndex >= 0 && currentIndex < tabItems.length) {
				tabItems[currentIndex].click();
			} else if (currentIndex === -1 && tabItems.length > 0) {
				tabItems[0].click();
			}
		} else {
			currentIndex = 0;
		}
	});

	return searchInput;
};

const createTabItemListContainer = () => {
	tabItemListContainer = document.createElement('div');
	tabItemListContainer.id = 'tab-item-list-container';
	tabItemListContainer.style.display = 'none';
	tabItemListContainer.style.borderTop = '1px solid #454f5b';
	tabItemListContainer.style.overflow = 'hidden';
	tabItemListContainer.style.padding = '14px 14px';

	return tabItemListContainer;
};

const bindGlobalKeyEvents = () => {
	document.addEventListener('keydown', (event) => {
		if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
			event.preventDefault();

			if (tabListContainer.style.display === 'block') {
				closeTabSpot();
			} else {
				tabListContainer.style.display = 'block';

				searchInput.focus();
			}
		}

		if (event.key === 'Escape') {
			closeTabSpot();
		}
	});
};

const closeTabSpot = () => {
	tabListContainer.style.display = 'none';
	tabItemListContainer.style.display = 'none';
	searchInput.value = '';
	currentIndex = -1;
	tabItemListContainer.innerHTML = '';
};

const createTabItem = (tab) => {
	const tabItem = document.createElement('div');
	tabItem.style.display = 'flex';
	tabItem.style.flexDirection = 'row';
	tabItem.style.padding = '4px 10px';
	tabItem.style.alignItems = 'center';
	tabItem.style.cursor = 'pointer';
	tabItem.style.borderRadius = '10px';
	tabItem.style.border = '1px solid #454f5b';
	tabItem.style.marginBottom = '10px';

	const tabItemGroupTitle = document.createElement('span');

	if (tab.groupTitle) {
		tabItemGroupTitle.textContent = tab.groupTitle;
		tabItemGroupTitle.style.fontSize = '11px';
		tabItemGroupTitle.style.padding = '2px 8px';
		tabItemGroupTitle.style.color = 'black';
		tabItemGroupTitle.style.backgroundColor = _chromeGroupColor(tab.groupColor);
		tabItemGroupTitle.style.marginRight = '10px';
		tabItemGroupTitle.style.borderRadius = '5px';
	}

	const tabItemTitle = document.createElement('span');
	tabItemTitle.className = 'tab-item';
	tabItemTitle.textContent = tab.title;
	tabItemTitle.style.fontSize = '12px';
	tabItemTitle.style.whiteSpace = 'nowrap';
	tabItemTitle.style.overflow = 'hidden';
	tabItemTitle.style.textOverflow = 'ellipsis';
	tabItemTitle.style.color = '#b3ccd6';

	if (tab.favIconUrl) {
		const tabItemImg = document.createElement('img');
		tabItemImg.src = tab.favIconUrl;
		tabItemImg.style.width = '18px';
		tabItemImg.style.height = '18px';
		tabItemImg.style.marginRight = '10px';
		tabItemImg.style.display = 'inline-block';

		tabItem.appendChild(tabItemImg);
	}

	tabItem.appendChild(tabItemGroupTitle);
	tabItem.appendChild(tabItemTitle);

	tabItem.addEventListener('click', async () => {
		closeTabSpot();

		await chrome.runtime.sendMessage({
			action: 'tabSpot:activateTab',
			tabId: tab.id,
			windowId: tab.windowId,
		});
	});

	return tabItem;
};
