export type MenuItem = {
	title: string;
	icon: string;
	component?: string;
	link?: string;
};

export type Tab = {
	icon: string;
	muted: boolean;
	pinned: boolean;
	protected: boolean;
	title: string;
	title_matcher: string;
	unique: boolean;
	url_matcher: string;
	group_id?: string;
};

export type Rule = {
	detection: string;
	name: string;
	tab: Tab;
	url_fragment: string;
};

export type Group = {
	id: string;
	title: string;
	color: string;
	collapsed: boolean;
};

export type Settings = {
	enable_new_version_notification: boolean;
	theme: string;
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
};

export type RuleModalParams = {
	index?: number;
	rule?: Rule;
};

export type GroupModalParams = {
	index?: number;
	group?: Group;
};

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'none';

export type ToastParams = {
	type: ToastType;
	message: string;
	timeout?: number;
};
