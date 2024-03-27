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
};

export type Rule = {
    detection: string;
    name: string;
    tab: Tab;
    url_fragment: string;
}

export type Settings = {
    enable_new_version_notification: boolean;
}

export type TabModifierSettings = {
    rules: Rule[];
    settings: Settings;
    theme: string;
};

export const GLOBAL_EVENTS = {
    OPEN_ADD_RULE_MODAL: 'OPEN_ADD_RULE_MODAL',
    CLOSE_ADD_RULE_MODAL: 'CLOSE_ADD_RULE_MODAL',
    GLOBAL_KEY_SAVE: 'GLOBAL_KEY_SAVE',
};

export type RuleModalParams = {
    index?: number;
    rule?: Rule;
};
