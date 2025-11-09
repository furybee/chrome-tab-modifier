import type { EmojiCategory } from './types';
import { data as smileysData } from './categories/smileys';
import { data as gesturesData } from './categories/gestures';
import { data as animalsData } from './categories/animals';
import { data as objectsData } from './categories/objects';
import { data as buildingsData } from './categories/buildings';
import { data as transportsData } from './categories/transports';
import { data as sportsData } from './categories/sports';
import { data as flagsData } from './categories/flags';

export const EMOJI_CATEGORIES: EmojiCategory[] = [
	{
		id: 'smileys',
		name: smileysData.name,
		icon: '😀',
		emojis: smileysData.emojis,
	},
	{
		id: 'gestures',
		name: gesturesData.name,
		icon: '👋',
		emojis: gesturesData.emojis,
	},
	{
		id: 'animals',
		name: animalsData.name,
		icon: '🐶',
		emojis: animalsData.emojis,
	},
	{
		id: 'buildings',
		name: buildingsData.name,
		icon: '🏠',
		emojis: buildingsData.emojis,
	},
	{
		id: 'transports',
		name: transportsData.name,
		icon: '🚗',
		emojis: transportsData.emojis,
	},
	{
		id: 'sports',
		name: sportsData.name,
		icon: '⚽',
		emojis: sportsData.emojis,
	},
	{
		id: 'objects',
		name: objectsData.name,
		icon: '💡',
		emojis: objectsData.emojis,
	},
	{
		id: 'flags',
		name: flagsData.name,
		icon: '🏳️',
		emojis: flagsData.emojis,
	},
];

export * from './types';
