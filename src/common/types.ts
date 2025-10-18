import { DefineComponent } from 'vue';

export type MenuItem = {
	title: string;
	icon: string;
	component?: string;
	link?: string;
};

export type Tab = {
	title: string;
	icon: string | null;
	muted: boolean;
	pinned: boolean;
	protected: boolean;
	unique: boolean;
	group_id?: string | null;
	title_matcher: string | null;
	url_matcher: string | null;
};

export type Rule = {
	id: string;
	name: string;
	detection: string;
	url_fragment: string;
	tab: Tab;
	is_enabled: boolean;
};

export type Group = {
	id: string;
	title: string;
	color: string;
	collapsed: boolean;
};

export type LightweightModePattern = {
	id: string;
	pattern: string;
	type: 'domain' | 'regex';
	enabled: boolean;
};

export type ClosedTab = {
	id: string;
	title: string;
	url: string;
	urlHash: string; // SHA-256 hash of URL for duplicate detection
	favIconUrl?: string;
	closedAt: number; // timestamp
};

export type Settings = {
	enable_new_version_notification: boolean;
	theme: string;
	lightweight_mode_enabled: boolean;
	lightweight_mode_patterns: LightweightModePattern[];
	auto_close_enabled: boolean;
	auto_close_timeout: number; // en minutes
};

export type TabModifierSettings = {
	rules: Rule[];
	groups: Group[];
	settings: Settings;
};

export const GLOBAL_EVENTS = {
	OPEN_ADD_RULE_MODAL: 'OPEN_ADD_RULE_MODAL',
	OPEN_ADD_GROUP_MODAL: 'OPEN_ADD_GROUP_MODAL',
	CLOSE_ADD_RULE_MODAL: 'CLOSE_ADD_RULE_MODAL',
	CLOSE_ADD_GROUP_MODAL: 'CLOSE_ADD_GROUP_MODAL',
	GLOBAL_KEY_SAVE: 'GLOBAL_KEY_SAVE',
	SHOW_TOAST: 'SHOW_TOAST',
	NAVIGATE_TO_SETTINGS: 'NAVIGATE_TO_SETTINGS',
};

export type RuleModalParams = {
	rule?: Rule;
};

export type GroupModalParams = {
	group?: Group;
};

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'none';

export type ToastParams = {
	type: ToastType;
	message: string;
	timeout?: number;
};

export type Components = Record<
	string,
	DefineComponent<NonNullable<unknown>, NonNullable<unknown>, any>
>;
