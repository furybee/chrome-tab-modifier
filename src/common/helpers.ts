export function _clone(obj: any) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	return JSON.parse(JSON.stringify(obj));
}

export function _shortify(text: string, length: number) {
	return text.length > length ? text.slice(0, length) + '...' : text;
}

export function _groupColors() {
	return [
		{ label: 'grey', value: 'grey', color: _chromeGroupColor('grey') },
		{ label: 'blue', value: 'blue', color: _chromeGroupColor('blue') },
		{ label: 'red', value: 'red', color: _chromeGroupColor('red') },
		{ label: 'yellow', value: 'yellow', color: _chromeGroupColor('yellow') },
		{ label: 'green', value: 'green', color: _chromeGroupColor('green') },
		{ label: 'pink', value: 'pink', color: _chromeGroupColor('pink') },
		{ label: 'purple', value: 'purple', color: _chromeGroupColor('purple') },
		{ label: 'cyan', value: 'cyan', color: _chromeGroupColor('cyan') },
		{ label: 'orange', value: 'orange', color: _chromeGroupColor('orange') },
	];
}

export function _chromeGroupColor(color: string) {
	switch (color) {
		case 'grey':
			return '#dadce0';
		case 'blue':
			return '#8ab4f7';
		case 'red':
			return '#f28b82';
		case 'yellow':
			return '#fdd663';
		case 'green':
			return '#81c995';
		case 'pink':
			return '#ff8bcb';
		case 'purple':
			return '#c589f9';
		case 'cyan':
			return '#78d9ec';
		case 'orange':
			return '#fcad70';
	}

	return '#dadce0';
}

export function _isDefined(...args: any[]) {
	return args.every((arg) => arg !== undefined);
}

export function _getThemes() {
	return [
		{ label: 'Dim', value: 'dim' },
		{ label: 'Dark', value: 'dark' },
		{ label: 'Halloween', value: 'halloween' },
		{ label: 'Light', value: 'light' },
		{ label: 'Cupcake', value: 'cupcake' },
		{ label: 'Valentine', value: 'valentine' },
	];
}

export function _getDetections() {
	return [
		{ name: 'Contains', value: 'CONTAINS' },
		{ name: 'Starts with', value: 'STARTS_WITH' },
		{ name: 'Exact', value: 'EXACT' },
		{ name: 'Ends with', value: 'ENDS_WITH' },
		{ name: 'Regex', value: 'REGEX' },
	];
}
export function _getIcons() {
	const assets = chrome.runtime.getURL('/assets/');

	return [
		{
			label: 'Default',
			value: 'chrome/default.png',
			icon: assets + 'chrome/default.png',
		},
		{
			label: 'Chrome',
			value: 'chrome/chrome.png',
			icon: assets + 'chrome/chrome.png',
		},
		{
			label: 'Bookmarks',
			value: 'chrome/bookmarks.png',
			icon: assets + 'chrome/bookmarks.png',
		},
		{
			label: 'Downloads',
			value: 'chrome/downloads.png',
			icon: assets + 'chrome/downloads.png',
		},
		{
			label: 'Extensions',
			value: 'chrome/extensions.png',
			icon: assets + 'chrome/extensions.png',
		},
		{
			label: 'History',
			value: 'chrome/history.png',
			icon: assets + 'chrome/history.png',
		},
		{
			label: 'Settings',
			value: 'chrome/settings.png',
			icon: assets + 'chrome/settings.png',
		},
		{
			label: 'amber',
			value: 'bullets/bullet-amber.png',
			icon: assets + 'bullets/bullet-amber.png',
		},
		{
			label: 'amber-alt',
			value: 'bullets/bullet-amber-alt.png',
			icon: assets + 'bullets/bullet-amber-alt.png',
		},
		{
			label: 'blue',
			value: 'bullets/bullet-blue.png',
			icon: assets + 'bullets/bullet-blue.png',
		},
		{
			label: 'blue-alt',
			value: 'bullets/bullet-blue-alt.png',
			icon: assets + 'bullets/bullet-blue-alt.png',
		},
		{
			label: 'blue-grey',
			value: 'bullets/bullet-blue-grey.png',
			icon: assets + 'bullets/bullet-blue-grey.png',
		},
		{
			label: 'blue-grey-alt',
			value: 'bullets/bullet-blue-grey-alt.png',
			icon: assets + 'bullets/bullet-blue-grey-alt.png',
		},
		{
			label: 'cyan',
			value: 'bullets/bullet-cyan.png',
			icon: assets + 'bullets/bullet-cyan.png',
		},
		{
			label: 'cyan-alt',
			value: 'bullets/bullet-cyan-alt.png',
			icon: assets + 'bullets/bullet-cyan-alt.png',
		},
		{
			label: 'deep-orange',
			value: 'bullets/bullet-deep-orange.png',
			icon: assets + 'bullets/bullet-deep-orange.png',
		},
		{
			label: 'deep-orange-alt',
			value: 'bullets/bullet-deep-orange-alt.png',
			icon: assets + 'bullets/bullet-deep-orange-alt.png',
		},
		{
			label: 'green',
			value: 'bullets/bullet-green.png',
			icon: assets + 'bullets/bullet-green.png',
		},
		{
			label: 'green-alt',
			value: 'bullets/bullet-green-alt.png',
			icon: assets + 'bullets/bullet-green-alt.png',
		},
		{
			label: 'indigo',
			value: 'bullets/bullet-indigo.png',
			icon: assets + 'bullets/bullet-indigo.png',
		},
		{
			label: 'indigo-alt',
			value: 'bullets/bullet-indigo-alt.png',
			icon: assets + 'bullets/bullet-indigo-alt.png',
		},
		{
			label: 'pink',
			value: 'bullets/bullet-pink.png',
			icon: assets + 'bullets/bullet-pink.png',
		},
		{
			label: 'pink-alt',
			value: 'bullets/bullet-pink-alt.png',
			icon: assets + 'bullets/bullet-pink-alt.png',
		},
		{
			label: 'purple',
			value: 'bullets/bullet-purple.png',
			icon: assets + 'bullets/bullet-purple.png',
		},
		{
			label: 'purple-alt',
			value: 'bullets/bullet-purple-alt.png',
			icon: assets + 'bullets/bullet-purple-alt.png',
		},
		{
			label: 'red',
			value: 'bullets/bullet-red.png',
			icon: assets + 'bullets/bullet-red.png',
		},
		{
			label: 'red-alt',
			value: 'bullets/bullet-red-alt.png',
			icon: assets + 'bullets/bullet-red-alt.png',
		},
		{
			label: 'teal',
			value: 'bullets/bullet-teal.png',
			icon: assets + 'bullets/bullet-teal.png',
		},
		{
			label: 'teal-alt',
			value: 'bullets/bullet-teal-alt.png',
			icon: assets + 'bullets/bullet-teal-alt.png',
		},
	];
}
