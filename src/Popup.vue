<template>
	<div class="min-w-[400px] max-w-[400px] max-h-[400px] overflow-auto p-4">
		<RuleForm
			v-if="isInit"
			:rule="rule"
			:options="{ showCancel: false, showTitle: true, showOptionLink: true }"
			@on-save="reloadTab"
		/>
	</div>
</template>
<script setup lang="ts">
import { useRulesStore } from './stores/rules.store.ts';
import { onMounted, ref } from 'vue';
import RuleForm from './components/options/center/sections/TabRules/RuleForm.vue';
import { _getRuleFromUrl, _getDefaultRule, _getStorageAsync } from './common/storage.ts';

const rulesStore = useRulesStore();
const isInit = ref(false);
const rule = ref(_getDefaultRule('', '{title}', 'url'));

const tab = ref<chrome.tabs.Tab | null>(null);

const reloadTab = () => {
	if (!tab.value?.id) return;

	chrome.tabs.reload(tab.value.id);
};

chrome.tabs.onUpdated.addListener((_: number, changeInfo: chrome.tabs.TabChangeInfo) => {
	if (!changeInfo.url) return;

	_getRuleFromUrl(changeInfo.url).then((foundRule) => {
		if (!foundRule) return;

		rule.value = foundRule;
		rulesStore.currentRule = foundRule;
	});
});

onMounted(async () => {
	await rulesStore.init();

	const queryOptions = { active: true, lastFocusedWindow: true };
	const tabs = await chrome.tabs.query(queryOptions);

	if (tabs.length === 0) return;

	tab.value = tabs[0];

	if (tab.value.url) {
		const foundRule = await _getRuleFromUrl(tab.value.url);

		if (!foundRule) {
			rule.value.url_fragment = tab.value.url;
		} else {
			rule.value = foundRule;
			rulesStore.currentRule = foundRule;
		}
	}

	isInit.value = true;
});
</script>
