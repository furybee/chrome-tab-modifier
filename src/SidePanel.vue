<template>
	<div class="h-screen bg-base-100 flex flex-col relative">
		<div class="absolute inset-0 opacity-10 pointer-events-none">
			<div class="pattern-background"></div>
		</div>

		<!-- Tabs -->
		<div role="tablist" class="tabs tabs-bordered tabs-lg bg-base-200 relative z-10">
			<a
				role="tab"
				class="tab text-sm"
				:class="{ 'tab-active': activeTab === 'add-rule' }"
				@click="activeTab = 'add-rule'"
			>
				Rules
			</a>
			<a
				role="tab"
				class="tab text-sm"
				:class="{ 'tab-active': activeTab === 'hive' }"
				@click="activeTab = 'hive'"
			>
				🍯 Tab Hive
			</a>
		</div>

		<div class="flex-1 overflow-y-auto p-4 relative z-10">
			<!-- Add Rule Tab -->
			<div v-if="activeTab === 'add-rule'">
				<RuleForm
					v-if="isInit"
					:key="formKey"
					:rule="rule"
					:options="{ showCancel: false, showTitle: true, showOptionLink: true }"
					@on-save="onRuleSaved"
				/>
			</div>

			<!-- Tab Hive Tab -->
			<div v-if="activeTab === 'hive'">
				<TabHive />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { _getDefaultRule, _getRuleFromUrl } from './common/storage';
import { useRulesStore } from './stores/rules.store';
import RuleForm from './components/options/center/sections/TabRules/RuleForm.vue';
import TabHive from './components/TabHive.vue';

const rulesStore = useRulesStore();
const activeTab = ref<'hive' | 'add-rule'>('add-rule');
const isInit = ref(false);
const rule = ref(_getDefaultRule('', '', ''));
const formKey = ref(0); // Key to force re-render of RuleForm

async function onRuleSaved() {
	// Reset the form to defaults after saving
	rule.value = _getDefaultRule('', '', '');

	// Reload the active tab to apply changes
	try {
		const queryOptions = { active: true, lastFocusedWindow: true };
		const tabs = await chrome.tabs.query(queryOptions);

		if (tabs.length > 0 && tabs[0].id) {
			await chrome.tabs.reload(tabs[0].id);
			console.log('[SidePanel] Reloaded active tab after saving');
		}
	} catch (error) {
		console.error('[SidePanel] Error reloading tab:', error);
	}
}

async function updateFormForUrl(url: string) {
	console.log('[SidePanel] Updating form for URL:', url);

	const foundRule = await _getRuleFromUrl(url);

	if (foundRule) {
		// Rule exists for this URL, load it
		console.log('[SidePanel] Found rule:', foundRule);
		rule.value = { ...foundRule };
		rulesStore.currentRule = foundRule;
	} else {
		// No rule exists, reset form with new URL pre-filled
		console.log('[SidePanel] No rule found, resetting with URL:', url);
		rule.value = _getDefaultRule('', '', url);
		rulesStore.currentRule = undefined;
	}

	// Force re-render of RuleForm component
	formKey.value++;

	console.log('[SidePanel] Rule value updated:', rule.value);
}

// Listen for tab updates to refresh the form when navigating
chrome.tabs.onUpdated.addListener(
	async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		console.log('[SidePanel] Tab updated:', tabId, changeInfo);

		if (!changeInfo.url) return;

		// Only update if it's the active tab in the current window
		if (!tab.active) return;

		await updateFormForUrl(changeInfo.url);
	}
);

// Listen for tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
	console.log('[SidePanel] Tab activated:', activeInfo);

	const tab = await chrome.tabs.get(activeInfo.tabId);
	if (tab.url) {
		await updateFormForUrl(tab.url);
	}
});

onMounted(async () => {
	await rulesStore.init();

	// Get the current active tab to pre-fill the form
	try {
		const queryOptions = { active: true, lastFocusedWindow: true };
		const tabs = await chrome.tabs.query(queryOptions);

		if (tabs.length > 0 && tabs[0].url) {
			const currentTab = tabs[0];

			if (!currentTab.url) return;

			const foundRule = await _getRuleFromUrl(currentTab.url);

			if (foundRule) {
				// Rule exists for this URL, load it
				rule.value = foundRule;
				rulesStore.currentRule = foundRule;
			} else {
				// No rule exists, pre-fill with current URL
				rule.value.url_fragment = currentTab.url;
			}
		}
	} catch (error) {
		console.error('[Tabee] Error getting current tab:', error);
	}

	isInit.value = true;
});
</script>

<style scoped>
.pattern-background {
	width: 100%;
	height: 100%;
	background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
	background-size: 32px 32px;
}
</style>
