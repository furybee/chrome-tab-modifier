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

	document.head.appendChild(document.createElement('style')).textContent = `
		.ts-tab-list-container {
			display: none;
			background-color: rgba(42, 48, 60, 0.95)!important;
			color: white!important;
			position: fixed!important;
			top: 30%!important;
			right: 0!important;
			left: 0!important;
			width: 100%!important;
			max-width: 600px!important;
			z-index: 99999!important;
			margin: 0 auto!important;
			overflow: hidden!important;
			max-height: 500px!important;
			box-shadow: 0 0 10px rgba(42, 48, 60, 0.7)!important;
			border-radius: 15px!important;
			font-family: Arial, sans-serif!important;
			border: 1px solid #454f5b!important;
		}
		
		.ts-tab-list-container input[type=search].ts-search-input {
			width: 100%!important;
			padding: 10px 16px!important;
			font-family: Arial, sans-serif!important;
			font-size: 16px!important;
			box-sizing: border-box!important;
			outline: none!important;
			background-color: transparent!important;
			border: none!important;
			border-color: transparent!important;
			outline: none!important;
			color: #b3ccd6!important;
			caret-color: #c792e9!important;
		}
		
		.ts-tab-list-container .ts-tab-item-list-container {
			display: none;
			border-top: 1px solid #454f5b!important;
			overflow-x: hidden!important;
			overflow-y: auto!important;
			max-height: 240px!important;
			padding: 4px 5px 10px!important;
    	scrollbar-color: #ffffff40 #0000!important;
		}
		
		.ts-tab-list-container .ts-tab-item-list-container .ts-tab-item {
			padding: 6px 10px !important;
			cursor: pointer!important;
			border-radius: 5px!important;
			display: flex!important;
			flex-direction: row!important;
			align-items: center!important;
			overflow: hidden!important;
		}
		
		.ts-tab-list-container .ts-tab-item-list-container .ts-tab-item div {
			overflow: hidden!important;
		}
		
		.ts-tab-list-container .ts-tab-item-list-container .ts-tab-item .ts-tab-item-title {
			font-size: 12px!important;
			white-space: nowrap!important;
			overflow: hidden!important;
			text-overflow: ellipsis!important;
			color: #b3ccd6!important;
		}
		
		.ts-tab-list-container .ts-tab-item-list-container .ts-tab-item .ts-tab-item-url {
			font-size: 11px!important;
			white-space: nowrap!important;
			overflow: hidden!important;
			text-overflow: ellipsis!important;
			color: #b3ccd6!important;
			opacity: 70%;
			margin-top: 3px;
		}
		
		.ts-tab-list-container .ts-tab-item-list-container .ts-tab-item .ts-tab-item-img {
			width: 18px!important;
			height: 18px!important;
			margin-right: 10px!important;
			display: inline-block!important;
		}
		
		.ts-tab-list-container .ts-tab-item-list-container .ts-tab-item .ts-tab-group-title {
			font-size: 11px!important;
			padding: 2px 8px!important;
			color: black!important;
			margin-right: 10px!important;
			border-radius: 5px!important;
		}
	`;

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
	const tabItems = tabItemListContainer.querySelectorAll('.ts-tab-item');

	highlightSelectedItem(tabItems);
};

const highlightSelectedItem = (tabItems) => {
	tabItemListContainer.querySelectorAll('.ts-tab-item').forEach((item) => {
		item.style.backgroundColor = 'transparent';
	});

	currentIndex = currentIndex === -1 ? 0 : currentIndex;
	if (currentIndex >= 0 && currentIndex < tabItems.length) {
		tabItems[currentIndex].style.backgroundColor = '#4f5d75';
		tabItems[currentIndex].scrollIntoView({ block: 'nearest' });
	}
};

const createTabListContainer = () => {
	tabListContainer = document.createElement('div');
	tabListContainer.id = 'tab-list-container';
	tabListContainer.className = 'ts-tab-list-container';

	return tabListContainer;
};

const createSearchInput = () => {
	searchInput = document.createElement('input');
	searchInput.type = 'search';
	searchInput.placeholder = 'Search tabs...';
	searchInput.className = 'ts-search-input';

	searchInput.addEventListener('input', () => {
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

	searchInput.addEventListener('keydown', (event) => {
		const tabItems = Array.from(tabItemListContainer.querySelectorAll('.ts-tab-item'));

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
	tabItemListContainer.className = 'ts-tab-item-list-container';

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
		} else if (event.key === 'Escape') {
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
	tabItem.className = 'ts-tab-item';

	const tabItemGroupTitle = document.createElement('span');

	if (tab.groupTitle) {
		tabItemGroupTitle.textContent = tab.groupTitle;
		tabItemGroupTitle.className = 'ts-tab-group-title';
		tabItemGroupTitle.style.backgroundColor = _chromeGroupColor(tab.groupColor);
	}

	const tabItemTitle = document.createElement('span');
	tabItemTitle.className = 'ts-tab-item-title';
	tabItemTitle.textContent = tab.title;

	const tabItemUrl = document.createElement('div');
	tabItemUrl.className = 'ts-tab-item-url';
	tabItemUrl.textContent = tab.url;

	if (tab.favIconUrl) {
		const tabItemImg = document.createElement('img');
		tabItemImg.src = tab.favIconUrl;
		tabItemImg.className = 'ts-tab-item-img';

		tabItem.appendChild(tabItemImg);
	} else {
		const tabItemImg = document.createElement('div');
		tabItemImg.className = 'ts-tab-item-img';

		tabItem.appendChild(tabItemImg);
	}

	const tabItemTextGroup = document.createElement('div');
	const tabItemText1 = document.createElement('div');
	const tabItemText2 = document.createElement('div');

	tabItemText1.appendChild(tabItemGroupTitle);
	tabItemText1.appendChild(tabItemTitle);
	tabItemText2.appendChild(tabItemUrl);

	tabItemTextGroup.appendChild(tabItemText1);
	tabItemTextGroup.appendChild(tabItemText2);

	tabItem.appendChild(tabItemTextGroup);

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
