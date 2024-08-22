import { _chromeGroupColor } from './common/helpers.ts';

let tabListContainer;
let searchInput;
let tabItemListContainer;
let currentIndex = -1;

const highlightFoundItems = () => {
	const tabItems = tabItemListContainer.querySelectorAll('.tab-item');
	highlightSelectedItem(tabItems);
};
const highlightSelectedItem = (visibleItems) => {
	tabItemListContainer.querySelectorAll('.tab-item').forEach((item) => {
		item.parentElement.style.backgroundColor = 'transparent';
	});

	if (currentIndex >= 0 && currentIndex < visibleItems.length) {
		visibleItems[currentIndex].parentElement.style.backgroundColor = '#4f5d75';
		visibleItems[currentIndex].parentElement.scrollIntoView({ block: 'nearest' });
	}
};

export const initTabSpot = async () => {
	tabListContainer = document.createElement('div');
	tabListContainer.id = 'tab-list-container';
	tabListContainer.style.display = 'none';
	tabListContainer.style.backgroundColor = 'rgba(42, 48, 60, 0.95)';
	tabListContainer.style.color = 'black';
	tabListContainer.style.position = 'fixed';
	tabListContainer.style.top = '30%';
	tabListContainer.style.right = '0';
	tabListContainer.style.left = '0';
	tabListContainer.style.width = '100%';
	tabListContainer.style.maxWidth = '600px';
	tabListContainer.style.zIndex = '9999';
	tabListContainer.style.margin = '0 auto';
	tabListContainer.style.overflowY = 'auto';
	tabListContainer.style.overflowX = 'hidden';
	tabListContainer.style.maxHeight = '500px';
	tabListContainer.style.boxShadow = '0 0 10px rgba(42, 48, 60, 0.7)';
	tabListContainer.style.borderRadius = '15px';
	tabListContainer.style.fontFamily = 'Arial, sans-serif';
	tabListContainer.style.border = '1px solid #454f5b';

	searchInput = document.createElement('input');
	searchInput.type = 'search';
	searchInput.placeholder = 'Search tabs...';
	searchInput.style.width = '100%';
	searchInput.style.padding = '10px 16px';
	searchInput.style.fontFamily = 'Arial, sans-serif';
	searchInput.style.fontSize = '15pt';
	searchInput.style.boxSizing = 'border-box';
	searchInput.style.outline = 'none';
	searchInput.style.backgroundColor = 'transparent';
	searchInput.placeholder = 'Search tabs...';
	searchInput.style.border = 'none';
	searchInput.style.outline = 'none';
	searchInput.style.color = '#b3ccd6';

	tabListContainer.appendChild(searchInput);

	tabItemListContainer = document.createElement('div');
	tabItemListContainer.id = 'tab-item-list-container';
	tabItemListContainer.style.display = 'none';
	tabItemListContainer.style.borderTop = '1px solid #454f5b';
	tabItemListContainer.style.overflow = 'hidden';
	tabItemListContainer.style.padding = '14px 14px';

	tabListContainer.appendChild(tabItemListContainer);

	document.body.appendChild(tabListContainer);

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
		const visibleItems = Array.from(tabItemListContainer.querySelectorAll('.tab-item'));

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			currentIndex = (currentIndex + 1) % visibleItems.length;
			highlightSelectedItem(visibleItems);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
			highlightSelectedItem(visibleItems);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (currentIndex >= 0 && currentIndex < visibleItems.length) {
				visibleItems[currentIndex].click();
			}
		}
	});

	document.addEventListener('keydown', (event) => {
		if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
			event.preventDefault();
			const existingContainer = document.getElementById('tab-list-container');
			if (!existingContainer) {
				console.error('TabSpot: Container not found');
			} else {
				if (existingContainer.style.display === 'block') {
					closeTabSpot();
				} else {
					existingContainer.style.display = 'block';

					searchInput.focus();
				}
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

export const refreshResults = async (tabs, groups) => {
	tabItemListContainer.innerHTML = '';

	if (tabs) {
		tabItemListContainer.style.display = 'block';

		tabs?.forEach((tab) => {
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

			if (tab) {
				if (tab.groupTitle) {
					tabItemGroupTitle.className = 'tab-item';
					tabItemGroupTitle.textContent = tab.groupTitle;
					tabItemGroupTitle.style.fontSize = '10pt';
					tabItemGroupTitle.style.padding = '2px 6px';
					tabItemGroupTitle.style.color = 'black';
					tabItemGroupTitle.style.backgroundColor = _chromeGroupColor(tab.groupColor);
					tabItemGroupTitle.style.marginRight = '10px';
					tabItemGroupTitle.style.borderRadius = '5px';
				}
			}

			const tabItemTitle = document.createElement('span');
			tabItemTitle.className = 'tab-item';
			tabItemTitle.textContent = tab.title;
			searchInput.style.fontSize = '12pt';
			tabItemTitle.style.whiteSpace = 'nowrap';
			tabItemTitle.style.overflow = 'hidden';
			tabItemTitle.style.textOverflow = 'ellipsis';
			tabItemTitle.style.color = '#b3ccd6';

			if (tab.favIconUrl) {
				const tabItemImg = document.createElement('img');
				tabItemImg.src = tab.favIconUrl;
				tabItemImg.style.width = '20px';
				tabItemImg.style.height = '20px';
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

			tabItemListContainer.appendChild(tabItem);
		});

		document.body.appendChild(tabListContainer);

		highlightFoundItems();

		searchInput.focus();
	}
};

export const refreshTabSpot = async () => {
	await chrome.runtime.sendMessage({ action: 'tabSpot:refresh' });
};
