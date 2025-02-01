let wList = [];

function replaceUrlParam(e, a, t) {
	const n = new URL(e);

	n.searchParams.set(a, t || '');

	return n.toString();
}

function doThat() {
	const els = document.querySelectorAll('#b_results li.b_algo .b_attribution>cite');

	[...els].forEach((el) => {
		const t = new URL(el.innerText.replace('www.', '')).hostname;
		if (wList[t]) {
			const n = wList[t];

			const i = document.createElement('a');
			i.href = 'chrome-extension://' + chrome.runtime.id + '/sum/learn_more.html';
			i.target = '_blank';
			i.style.cssText = 'display: block; float: right;';
			i.innerHTML =
				'<svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#555555"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="12" r="10" stroke="#555" stroke-width="1.5"/> <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g></svg>';

			el.closest('li.b_algo').prepend(i);
		}
	});
}

function getwList() {
	chrome.runtime.sendMessage({ action: 'w_list' }, (e) => {
		if (e.status === 'loaded') {
			wList = e.wList;

			doThat();
		} else {
			chrome.storage.local.get(['wList'], (value) => {
				wList = value.wList || {};
				doThat();
			});
		}
	});
}

chrome.storage.local.get(['permissionsGranted'], function (result) {
	if (result.permissionsGranted !== false) {
		getwList();
	}
});
