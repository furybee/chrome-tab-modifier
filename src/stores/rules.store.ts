import {defineStore} from 'pinia'

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
    $$hashKey?: string;
    detection: string;
    name: string;
    tab: Tab;
    url_fragment: string;
}

export type Settings = {
    enable_new_version_notification: boolean;
}

const STORAGE_KEY = 'tab_modifier';

const getStorage = (callback) => {
    chrome.storage.local.get(STORAGE_KEY, (items) => {
        callback(items.tab_modifier);
    });
};

function getStorageAsync() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(STORAGE_KEY, (items) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(items[STORAGE_KEY]);
            }
        });
    });
}

export const useRulesStore = defineStore('rules', {
    state: () => {
        return {
            currentRule: undefined as Rule | undefined,
            rules: [] as Rule[],
            settings: {} as Settings
        }
    },
    actions: {
        async init() {
            try {
                const tab_modifier = await getStorageAsync();

                if (tab_modifier === undefined) {
                    console.log('tab_modifier is undefined');
                } else {
                    console.log('tab_modifier is defined', tab_modifier.rules);
                    this.rules = tab_modifier.rules;
                }
            } catch (error) {
                console.error('Failed to load rules:', error);
            }
        },
        setCurrentRule(rule?: Rule) {
            this.currentRule = rule;
        },
        saveCurrentRule(rule: Rule) {
            console.log('saveCurrentRule', rule);
        },
        async addRule(rule: Rule) {
            try {
                let tab_modifier = await getStorageAsync();
                tab_modifier = undefined;

                if (tab_modifier === undefined) {
                    tab_modifier = {
                        settings: {
                            enable_new_version_notification: false
                        },
                        rules: []
                    };
                }

                tab_modifier.rules.push(rule);

                chrome.storage.local.set({tab_modifier: tab_modifier});

                this.rules = tab_modifier.rules;
            } catch (error) {
                console.error('Failed to load rules:', error);
            }
        },
    },
});
