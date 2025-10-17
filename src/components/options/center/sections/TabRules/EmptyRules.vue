<template>
	<div class="hero min-h-screen bg-base-200 relative overflow-hidden">
		<div class="absolute inset-0 opacity-10">
			<div class="pattern-background"></div>
		</div>
		<div class="hero-content text-center relative z-10">
			<div class="max-w-lg">
				<h1 class="text-5xl font-bold">Hello there</h1>
				<p class="py-6 text-lg">There is no rule yet!</p>
				<p class="pb-6 text-base opacity-80">
					Rules allow you to automatically customize tabs based on their URL. You can change titles,
					icons, pin tabs, group them, and much more when they match your criteria.
				</p>
				<div class="flex gap-3 justify-center">
					<button class="btn btn-primary" @click="onGetStartedClicked">Create my first Rule</button>
					<button class="btn btn-outline" @click="onLoadSamplesClicked">
						Start with Sample Rules
					</button>
				</div>

				<Disclaimer class="mt-8" :tips="rulesTips" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { GLOBAL_EVENTS, Rule } from '../../../../../common/types.ts';
import Disclaimer from '../../../../global/Disclaimer.vue';
import { useRulesStore } from '../../../../../stores/rules.store.ts';
import { _generateRandomId } from '../../../../../common/helpers.ts';

const emitter: any = inject('emitter');
const rulesStore = useRulesStore();

const onGetStartedClicked = () => {
	emitter.emit(GLOBAL_EVENTS.OPEN_ADD_RULE_MODAL);
};

const onLoadSamplesClicked = async () => {
	// First, create sample groups
	const workGroup = {
		id: _generateRandomId(),
		title: 'Work',
		color: 'blue',
		collapsed: false,
	};

	const personalGroup = {
		id: _generateRandomId(),
		title: 'Personal',
		color: 'green',
		collapsed: false,
	};

	const devGroup = {
		id: _generateRandomId(),
		title: 'Development',
		color: 'orange',
		collapsed: false,
	};

	// Add groups to the store
	await rulesStore.addGroup(workGroup);
	await rulesStore.addGroup(personalGroup);
	await rulesStore.addGroup(devGroup);

	const sampleRules: Rule[] = [
		{
			id: _generateRandomId(),
			name: 'Gmail',
			detection: 'CONTAINS',
			url_fragment: 'mail.google.com',
			is_enabled: true,
			tab: {
				title: '{title}',
				icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNFQTQzMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNCA0aDE2YzEuMSAwIDIgLjkgMiAydjEyYzAgMS4xLS45IDItMiAySDRjLTEuMSAwLTItLjktMi0yVjZjMC0xLjEuOS0yIDItMnoiLz48cG9seWxpbmUgcG9pbnRzPSIyMiw2IDEyLDEzIDIsNiIvPjwvc3ZnPg==',
				muted: false,
				pinned: true,
				protected: false,
				unique: true,
				group_id: workGroup.id,
				title_matcher: null,
				url_matcher: null,
			},
		},
		{
			id: _generateRandomId(),
			name: 'YouTube',
			detection: 'STARTS_WITH',
			url_fragment: 'https://www.youtube.com',
			is_enabled: true,
			tab: {
				title: '{title}',
				icon: 'https://www.youtube.com/favicon.ico',
				muted: true,
				pinned: false,
				protected: false,
				unique: false,
				group_id: personalGroup.id,
				title_matcher: null,
				url_matcher: null,
			},
		},
		{
			id: _generateRandomId(),
			name: 'Google Drive',
			detection: 'CONTAINS',
			url_fragment: 'drive.google.com',
			is_enabled: true,
			tab: {
				title: '[Drive] {title}',
				icon: null,
				muted: false,
				pinned: false,
				protected: true,
				unique: false,
				group_id: null,
				title_matcher: null,
				url_matcher: null,
			},
		},
		{
			id: _generateRandomId(),
			name: 'Google Services',
			detection: 'REGEX',
			url_fragment: '(docs|sheets|slides)\\.google\\.com',
			is_enabled: true,
			tab: {
				title: '{title}',
				icon: null,
				muted: false,
				pinned: false,
				protected: false,
				unique: false,
				group_id: workGroup.id,
				title_matcher: null,
				url_matcher: null,
			},
		},
		{
			id: _generateRandomId(),
			name: 'Google Calendar',
			detection: 'EXACT',
			url_fragment: 'https://calendar.google.com/calendar',
			is_enabled: true,
			tab: {
				title: 'Calendar',
				icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0Mjg1RjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSI0IiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxsaW5lIHgxPSIxNiIgeTE9IjIiIHgyPSIxNiIgeTI9IjYiLz48bGluZSB4MT0iOCIgeTE9IjIiIHgyPSI4IiB5Mj0iNiIvPjxsaW5lIHgxPSIzIiB5MT0iMTAiIHgyPSIyMSIgeTI9IjEwIi8+PC9zdmc+',
				muted: false,
				pinned: true,
				protected: true,
				unique: true,
				group_id: workGroup.id,
				title_matcher: null,
				url_matcher: null,
			},
		},
		{
			id: _generateRandomId(),
			name: 'Google Meet',
			detection: 'CONTAINS',
			url_fragment: 'meet.google.com',
			is_enabled: true,
			tab: {
				title: '[Meet] {title}',
				icon: null,
				muted: false,
				pinned: false,
				protected: false,
				unique: false,
				group_id: workGroup.id,
				title_matcher: null,
				url_matcher: null,
			},
		},
		{
			id: _generateRandomId(),
			name: 'Wikipedia Articles',
			detection: 'REGEX',
			url_fragment: 'wikipedia\\.org/wiki/',
			is_enabled: true,
			tab: {
				title: '@1',
				icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
				muted: false,
				pinned: false,
				protected: false,
				unique: false,
				group_id: null,
				title_matcher: '(.+)\\s+[—\\-]\\s+Wikip[ée]dia',
				url_matcher: null,
			},
		},
		{
			id: _generateRandomId(),
			name: 'GitHub Issues',
			detection: 'REGEX',
			url_fragment: 'github\\.com/.+/issues/(\\d+)',
			is_enabled: true,
			tab: {
				title: 'Issue #$1',
				icon: 'https://github.com/favicon.ico',
				muted: false,
				pinned: false,
				protected: false,
				unique: false,
				group_id: devGroup.id,
				title_matcher: null,
				url_matcher: '/issues/(\\d+)',
			},
		},
	];

	// Add all sample rules
	for (const rule of sampleRules) {
		await rulesStore.addRule(rule);
	}

	// Show success toast
	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: `${sampleRules.length} sample rules created successfully!`,
	});

	// Refresh the rules store to update the UI
	await rulesStore.init();
};

const rulesTips = [
	{
		id: 1,
		icon: '💡',
		text: 'You can backup and import your rules in',
		linkText: 'Settings',
		action: 'navigate-settings',
	},
	{
		id: 2,
		icon: '🎯',
		text: 'Rules are applied in order - drag to reorder them',
	},
	{
		id: 3,
		icon: '⚡',
		text: 'Use RegEx detection for advanced URL matching',
	},
	{
		id: 4,
		icon: '🔍',
		text: 'Right-click any page to quickly rename its tab',
	},
];
</script>

<style scoped>
.pattern-background {
	width: 100%;
	height: 100%;
	background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
	background-size: 32px 32px;
}
</style>
