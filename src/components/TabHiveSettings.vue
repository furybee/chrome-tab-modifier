<template>
	<div class="space-y-6">
		<!-- Auto-Close Settings Card -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Auto-Close Settings</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">Enable Auto-Close</h3>
						<p class="text-sm opacity-70">
							Automatically close inactive tabs after a specified timeout
						</p>
					</div>
					<div class="col-span-1 flex justify-end">
						<input
							v-model="autoCloseEnabled"
							class="toggle toggle-xs toggle-primary"
							type="checkbox"
							@change="saveSettings"
						/>
					</div>
				</div>

				<div v-if="autoCloseEnabled" class="grid grid-cols-6 mt-4">
					<div class="col-span-5">
						<h3 class="font-bold">Timeout (minutes)</h3>
						<p class="text-sm opacity-70">Close tabs inactive for this duration</p>
					</div>
					<div class="col-span-1 flex justify-end">
						<input
							v-model.number="autoCloseTimeout"
							type="number"
							min="1"
							max="1440"
							class="input input-xs input-bordered w-full"
							@change="saveSettings"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Reject List Card -->
		<div class="card bg-base-200">
			<div class="card-body">
				<div class="flex items-center justify-between mb-2">
					<h2 class="card-title">Reject List</h2>
					<RefreshButton @on-refresh-click="loadRejectList" />
				</div>
				<p class="text-sm opacity-70 mb-4">
					Domains and URLs excluded from auto-close. Tabs matching these patterns will never be
					closed automatically.
				</p>

				<div class="mb-4">
					<button class="btn btn-xs btn-outline btn-primary" @click="showAddPatternModal">
						Add Pattern
					</button>
				</div>

				<div v-if="rejectList.length === 0" class="text-center opacity-60 py-8">
					<p>No patterns in reject list</p>
					<p class="text-xs mt-2">
						Right-click on any tab and select "Exclude from Tab Hive" to add patterns
					</p>
				</div>

				<div v-else class="overflow-x-auto">
					<table class="table table-xs">
						<thead>
							<tr>
								<th>Type</th>
								<th>Pattern</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(pattern, index) in rejectList" :key="index">
								<td>
									<span
										class="badge badge-xs"
										:class="isUrl(pattern) ? 'badge-warning' : 'badge-info'"
									>
										{{ isUrl(pattern) ? 'URL' : 'Domain' }}
									</span>
								</td>
								<td class="font-mono text-xs">{{ pattern }}</td>
								<td>
									<button
										class="btn btn-xs btn-ghost btn-square"
										title="Remove"
										@click="removePattern(index)"
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
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Add Pattern Modal -->
		<dialog ref="addPatternDialog" class="modal">
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">Add Pattern to Reject List</h3>

				<div class="form-control mb-4">
					<label class="label">
						<span class="label-text">Type</span>
					</label>
					<select v-model="newPatternType" class="select select-sm select-bordered">
						<option value="domain">Domain</option>
						<option value="url">URL</option>
					</select>
				</div>

				<div class="form-control mb-4">
					<label class="label">
						<span class="label-text">Pattern</span>
					</label>
					<input
						v-model="newPatternValue"
						type="text"
						:placeholder="
							newPatternType === 'domain' ? 'example.com' : 'https://example.com/page'
						"
						class="input input-sm input-bordered"
					/>
					<label class="label">
						<span class="label-text-alt opacity-70">
							{{
								newPatternType === 'domain'
									? 'Enter a domain (e.g., github.com)'
									: 'Enter a full URL (e.g., https://github.com/project/issues)'
							}}
						</span>
					</label>
				</div>

				<div class="modal-action">
					<button class="btn btn-sm" @click="closeAddPatternModal">Cancel</button>
					<button class="btn btn-sm btn-primary" @click="addPattern" :disabled="!newPatternValue">
						Add
					</button>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRulesStore } from '../stores/rules.store';
import RefreshButton from './global/RefreshButton.vue';

const store = useRulesStore();

// Settings
const autoCloseEnabled = ref(false);
const autoCloseTimeout = ref(30);
const rejectList = ref<string[]>([]);

// Modal state
const addPatternDialog = ref<HTMLDialogElement | null>(null);
const newPatternType = ref<'domain' | 'url'>('domain');
const newPatternValue = ref('');

// Load settings
onMounted(async () => {
	await store.init();
	autoCloseEnabled.value = store.settings.auto_close_enabled;
	autoCloseTimeout.value = store.settings.auto_close_timeout;
	rejectList.value = [...(store.settings.tab_hive_reject_list || [])];
});

// Load reject list from store
async function loadRejectList() {
	await store.init();
	rejectList.value = [...(store.settings.tab_hive_reject_list || [])];
}

// Save settings
async function saveSettings() {
	store.settings.auto_close_enabled = autoCloseEnabled.value;
	store.settings.auto_close_timeout = autoCloseTimeout.value;
	await store.save();
}

// Check if pattern is a URL
function isUrl(pattern: string): boolean {
	try {
		new URL(pattern);
		return true;
	} catch {
		return false;
	}
}

// Add pattern modal
function showAddPatternModal() {
	newPatternValue.value = '';
	addPatternDialog.value?.showModal();
}

function closeAddPatternModal() {
	addPatternDialog.value?.close();
}

async function addPattern() {
	const pattern = newPatternValue.value.trim();
	if (!pattern) return;

	// Validate pattern
	if (newPatternType.value === 'url') {
		try {
			new URL(pattern);
		} catch {
			alert('Invalid URL. Please enter a valid URL (e.g., https://example.com/page)');
			return;
		}
	}

	// Check for duplicates
	if (rejectList.value.includes(pattern)) {
		alert('This pattern already exists in the reject list');
		return;
	}

	// Add pattern
	rejectList.value.push(pattern);
	store.settings.tab_hive_reject_list = [...rejectList.value];
	await store.save();

	closeAddPatternModal();
}

async function removePattern(index: number) {
	if (!confirm('Are you sure you want to remove this pattern?')) {
		return;
	}

	rejectList.value.splice(index, 1);
	store.settings.tab_hive_reject_list = [...rejectList.value];
	await store.save();
}
</script>

<style scoped></style>
