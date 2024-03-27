export type MenuItem = {
    title: string;
    icon: string;
    component?: string;
    link?: string;
};

// export type TabGroup = {
//     id: number;
//     label: string;
//     color: 'grey' | 'blue' | 'red' | 'yellow' | 'green' | 'pink' | 'purple' | 'cyan' | 'orange';
//     override: boolean;
// }

export type Tab = {
    icon: string;
    muted: boolean;
    pinned: boolean;
    protected: boolean;
    title: string;
    title_matcher: string;
    unique: boolean;
    url_matcher: string;
    // group?: TabGroup;
    group_id?: number;
    group_color?: 'grey' | 'blue' | 'red' | 'yellow' | 'green' | 'pink' | 'purple' | 'cyan' | 'orange';
};

export type Rule = {
    detection: string;
    name: string;
    tab: Tab;
    url_fragment: string;
}

export type Group = {
    id: string;
    title: string;
    color: Tab;
    collapsed: boolean;
}

export type Settings = {
    enable_new_version_notification: boolean;
}

export type TabModifierSettings = {
    rules: Rule[];
    groups: Group[];
    settings: Settings;
    theme: string;
};

export const GLOBAL_EVENTS = {
    OPEN_ADD_RULE_MODAL: 'OPEN_ADD_RULE_MODAL',
    OPEN_ADD_GROUP_MODAL: 'OPEN_ADD_GROUP_MODAL',
    CLOSE_ADD_RULE_MODAL: 'CLOSE_ADD_RULE_MODAL',
    CLOSE_ADD_GROUP_MODAL: 'CLOSE_ADD_GROUP_MODAL',
    GLOBAL_KEY_SAVE: 'GLOBAL_KEY_SAVE',
};

export type RuleModalParams = {
    index?: number;
    rule?: Rule;
};

export type GroupModalParams = {
    index?: number;
    group?: Group;
};
