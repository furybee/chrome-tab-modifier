<template>
	<div>
		<div v-if="closedTabs.length > 0" class="flex justify-end mb-2">
			<button class="btn btn-xs btn-ghost" title="Clear all" @click="clearAllTabs">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
				Clear All
			</button>
		</div>

		<div v-if="loading" class="flex justify-center items-center h-full">
			<span class="loading loading-spinner loading-lg"></span>
		</div>

		<div
			v-else-if="closedTabs.length === 0"
			class="flex flex-col items-center justify-center h-full text-center opacity-60"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-16 w-16 mb-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<p class="text-lg font-semibold">The Hive is empty</p>
			<p class="text-sm mt-2">Tabs closed automatically will appear here</p>
		</div>

		<div v-else class="space-y-2">
			<div
				v-for="tab in closedTabs"
				:key="tab.id"
				class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
			>
				<div class="card-body p-3">
					<div class="flex items-start gap-3">
						<div class="avatar flex-shrink-0">
							<div class="w-6 h-6 rounded">
								<img
									v-if="tab.favIconUrl"
									:src="tab.favIconUrl"
									:alt="tab.title"
									class="w-full h-full object-contain"
									@error="onImageError"
								/>
								<div v-else class="w-full h-full bg-base-300 flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-sm truncate" :title="tab.title">
								{{ tab.title }}
							</h3>
							<p class="text-xs opacity-70 truncate" :title="tab.url">
								{{ tab.url }}
							</p>
							<p class="text-xs opacity-50 mt-1">
								{{ formatTime(tab.closedAt) }}
							</p>
						</div>

						<div class="flex flex-col items-center justify-center gap-1 flex-shrink-0">
							<button
								class="btn btn-xs btn-ghost btn-square"
								title="Remove from list"
								@click="deleteTab(tab.id)"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
							<button
								class="btn btn-xs btn-primary"
								title="Restore tab"
								@click="restoreTab(tab.id)"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { ClosedTab } from '../common/types';

const CLOSED_TABS_STORAGE_KEY = 'closed_tabs';

const closedTabs = ref<ClosedTab[]>([]);
const loading = ref(true);

async function loadClosedTabs() {
	loading.value = true;
	try {
		const result = await chrome.storage.local.get(CLOSED_TABS_STORAGE_KEY);
		closedTabs.value = result[CLOSED_TABS_STORAGE_KEY] || [];
	} catch (error) {
		console.error('Failed to load closed tabs:', error);
	} finally {
		loading.value = false;
	}
}

async function restoreTab(tabId: string) {
	try {
		// Send message to background script to restore the tab
		await chrome.runtime.sendMessage({
			action: 'restoreClosedTab',
			tabId: tabId,
		});

		// Reload the list
		await loadClosedTabs();
	} catch (error) {
		console.error('Failed to restore tab:', error);
	}
}

async function deleteTab(tabId: string) {
	try {
		const result = await chrome.storage.local.get(CLOSED_TABS_STORAGE_KEY);
		const tabs = result[CLOSED_TABS_STORAGE_KEY] || [];
		const filteredTabs = tabs.filter((t: ClosedTab) => t.id !== tabId);

		await chrome.storage.local.set({
			[CLOSED_TABS_STORAGE_KEY]: filteredTabs,
		});

		await loadClosedTabs();
	} catch (error) {
		console.error('Failed to delete tab:', error);
	}
}

async function clearAllTabs() {
	if (!confirm('Are you sure you want to clear all closed tabs?')) {
		return;
	}

	try {
		await chrome.storage.local.set({
			[CLOSED_TABS_STORAGE_KEY]: [],
		});

		await loadClosedTabs();
	} catch (error) {
		console.error('Failed to clear tabs:', error);
	}
}

function formatTime(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		return `${days} day${days > 1 ? 's' : ''} ago`;
	} else if (hours > 0) {
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	} else if (minutes > 0) {
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	} else {
		return 'Just now';
	}
}

function onImageError(event: Event) {
	const img = event.target as HTMLImageElement;
	img.style.display = 'none';
}

// Listen for storage changes to update the list in real-time
chrome.storage.local.onChanged.addListener(
	(changes: { [key: string]: chrome.storage.StorageChange }) => {
		if (changes[CLOSED_TABS_STORAGE_KEY]) {
			loadClosedTabs();
		}
	}
);

onMounted(() => {
	loadClosedTabs();
});
</script>

<style scoped></style>
