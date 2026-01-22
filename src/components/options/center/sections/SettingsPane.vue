<template>
	<div class="container mx-auto max-w-5xl p-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">General</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">Theme</h3>
						<p>Change Tabee theme</p>
					</div>
					<div class="col-span-1">
						<CustomSelect v-model="currentTheme" :items="themes" :show-clear-btn="false" />
					</div>
				</div>

				<div class="grid grid-cols-6 mt-4">
					<div class="col-span-5">
						<h3 class="font-bold">Debug Mode</h3>
						<p>Enable console logs in content script for troubleshooting</p>
					</div>
					<div class="col-span-1 flex justify-end">
						<input
							v-model="debugModeEnabled"
							class="toggle toggle-xs toggle-primary"
							type="checkbox"
						/>
					</div>
				</div>

				<!--				<div class="grid grid-cols-6 mt-4">-->
				<!--					<div class="col-span-5">-->
				<!--						<h3 class="font-bold">Notifications</h3>-->
				<!--						<p>-->
				<!--							Enable "New version" toast, a tab is opened on each new version with a link to the-->
				<!--							changelog-->
				<!--						</p>-->
				<!--					</div>-->
				<!--					<div class="col-span-1">-->
				<!--						<input checked class="toggle toggle-primary" type="checkbox" />-->
				<!--					</div>-->
				<!--				</div>-->
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">Tab Management</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">Lightweight Mode</h3>
						<p>Reduce memory usage by disabling Tabee on specific domains or URLs.</p>
					</div>
					<div class="col-span-1 flex justify-end">
						<input
							v-model="lightweightModeEnabled"
							class="toggle toggle-xs toggle-primary"
							type="checkbox"
						/>
					</div>
				</div>

				<div v-if="lightweightModeEnabled" class="mt-4">
					<div class="grid grid-cols-2 gap-4 mb-4">
						<label class="label cursor-pointer justify-start gap-2">
							<input
								v-model="lightweightModeApplyToRules"
								type="checkbox"
								class="checkbox checkbox-xs checkbox-primary"
							/>
							<span class="label-text text-xs">Apply to Rules</span>
						</label>
						<label class="label cursor-pointer justify-start gap-2">
							<input
								v-model="lightweightModeApplyToTabHive"
								type="checkbox"
								class="checkbox checkbox-xs checkbox-primary"
							/>
							<span class="label-text text-xs">Apply to Tab Hive</span>
						</label>
					</div>

					<div class="mb-4">
						<button class="btn btn-xs btn-outline btn-primary" @click="showAddPatternModal">
							Add Pattern
						</button>
					</div>

					<div v-if="lightweightModePatterns.length > 0" class="overflow-x-auto">
						<table class="table table-xs">
							<thead>
								<tr>
									<th>Enabled</th>
									<th>Type</th>
									<th>Pattern</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="pattern in lightweightModePatterns" :key="pattern.id">
									<td>
										<input
											v-model="pattern.enabled"
											type="checkbox"
											class="checkbox checkbox-xs checkbox-primary"
											@change="saveLightweightSettings"
										/>
									</td>
									<td>
										<span
											class="badge badge-xs"
											:class="pattern.type === 'domain' ? 'badge-info' : 'badge-warning'"
										>
											{{ pattern.type }}
										</span>
									</td>
									<td class="font-mono text-xs">{{ pattern.pattern }}</td>
									<td>
										<button
											class="btn btn-xs btn-error btn-outline"
											@click="deletePattern(pattern.id)"
										>
											Delete
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div v-else class="text-xs opacity-70">
						No patterns added yet. Click "Add Pattern" to exclude domains or URLs.
					</div>
				</div>

				<!-- Add Pattern Modal -->
				<dialog ref="addPatternModal" class="modal">
					<div class="modal-box">
						<h3 class="font-bold text-lg">Add Lightweight Mode Pattern</h3>
						<p class="text-xs opacity-70 mt-2">
							Specify a domain or regex pattern to exclude from Tabee processing.
						</p>

						<div class="form-control w-full mt-4">
							<label class="label">
								<span class="label-text">Type</span>
							</label>
							<select v-model="newPattern.type" class="select select-bordered select-xs">
								<option value="domain">Domain (simple matching)</option>
								<option value="regex">Regex (advanced)</option>
							</select>
						</div>

						<div class="form-control w-full mt-4">
							<label class="label">
								<span class="label-text">Pattern</span>
							</label>
							<input
								v-model="newPattern.pattern"
								type="text"
								placeholder="e.g., example.com or ^https://.*\\.example\\.com"
								class="input input-bordered input-xs w-full"
							/>
							<label class="label">
								<span class="label-text-alt">
									{{ newPattern.type === 'domain' ? 'Domain name to match' : 'Regex pattern' }}
								</span>
							</label>
						</div>

						<div class="modal-action">
							<form method="dialog">
								<button class="btn btn-sm">Cancel</button>
							</form>
							<button
								:disabled="!newPattern.pattern"
								class="btn btn-sm btn-outline btn-primary"
								@click="addPattern"
							>
								Add Pattern
							</button>
						</div>
					</div>
				</dialog>

				<div class="divider my-6"></div>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">🍯 Tab Hive: Auto-Close Inactive Tabs</h3>
						<p>
							Automatically close tabs that have been inactive for a specified duration. Closed tabs
							will be saved in Tab Hive for easy restoration.
						</p>
					</div>
					<div class="col-span-1 flex justify-end">
						<input
							v-model="autoCloseEnabled"
							class="toggle toggle-xs toggle-primary"
							type="checkbox"
						/>
					</div>
				</div>

				<div v-if="autoCloseEnabled" class="mt-4">
					<div class="form-control w-full max-w-xs">
						<label class="label">
							<span class="label-text text-xs">Close inactive tabs after</span>
						</label>
						<div class="flex gap-2 items-center">
							<input
								v-model.number="autoCloseTimeout"
								type="number"
								min="1"
								max="1440"
								class="input input-bordered input-xs w-24"
							/>
							<span class="text-xs">minute(s)</span>
						</div>
						<label class="label">
							<span class="label-text-alt">Minimum: 1 minute, Maximum: 24 hours (1440 min)</span>
						</label>
					</div>
				</div>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">Backup</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">Import tab rules</h3>
						<p>Restore your tab rules settings from an external JSON file.</p>
					</div>
					<div class="col-span-1">
						<button class="btn btn-xs btn-outline w-full" @click="showImportModal">Import</button>
						<dialog ref="importModal" class="modal">
							<div class="modal-box">
								<h3 class="font-bold text-lg">Import</h3>
								<p>Import tab rules settings from an external JSON file.</p>

								<label class="form-control w-full mt-4">
									<input
										ref="fileInput"
										type="file"
										accept=".json"
										class="file-input file-input-xs file-input-bordered w-full"
										@change="onFileChanged"
									/>
								</label>

								<div class="modal-action">
									<form method="dialog">
										<button class="btn btn-xs">Close</button>
									</form>

									<button
										:disabled="!fileLoaded"
										class="btn btn-xs btn-outline btn-accent ml-4 group"
										@click="importReplaceConfig"
									>
										Import & Replace
									</button>

									<button
										:disabled="!fileLoaded"
										class="btn btn-xs btn-outline btn-primary ml-4 group"
										@click="importMergeConfig"
									>
										Import & Merge
									</button>
								</div>
							</div>
						</dialog>
					</div>
				</div>

				<div class="grid grid-cols-6 mt-4">
					<div class="col-span-5">
						<h3 class="font-bold">Export tab rules</h3>
						<p>Export your tab rules for backup purpose or for sharing with friend.</p>
					</div>
					<div class="col-span-1">
						<button class="btn btn-xs btn-outline w-full" @click="exportConfig">Export</button>
					</div>
				</div>
			</div>
		</div>

		<div class="card bg-base-200 border border-error mt-4">
			<div class="card-body">
				<h2 class="card-title text-error">Danger zone</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">Delete all rules</h3>
						<p>
							Once you delete all rules, there is no going back except from backup. Please be
							certain.
						</p>
					</div>
					<div class="col-span-1">
						<button class="btn btn-xs btn-error btn-outline w-full" @click="onDeleteAllRules">
							Delete
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import CustomSelect from '../../../global/CustomSelect.vue';
import { inject, ref, watch } from 'vue';
import { useRulesStore } from '../../../../stores/rules.store.ts';
import { GLOBAL_EVENTS, LightweightModePattern } from '../../../../common/types.ts';
import { _getThemes, _generateRandomId } from '../../../../common/helpers.ts';

const emitter: any = inject('emitter');

const rulesStore = useRulesStore();

const currentTheme = ref(rulesStore.settings.theme);
const importModal = ref(null);
const fileInput = ref<HTMLInputElement | null>(null);
const fileLoaded = ref(false);

// Debug Mode
const debugModeEnabled = ref(rulesStore.settings.debug_mode ?? false);

// Lightweight Mode
const lightweightModeEnabled = ref(rulesStore.settings.lightweight_mode_enabled ?? false);
const lightweightModePatterns = ref<LightweightModePattern[]>(
	rulesStore.settings.lightweight_mode_patterns ?? []
);
const lightweightModeApplyToRules = ref(
	rulesStore.settings.lightweight_mode_apply_to_rules ?? true
);
const lightweightModeApplyToTabHive = ref(
	rulesStore.settings.lightweight_mode_apply_to_tab_hive ?? true
);
const addPatternModal = ref<HTMLDialogElement | null>(null);
const newPattern = ref({
	type: 'domain' as 'domain' | 'regex',
	pattern: '',
});

// Auto-Close
const autoCloseEnabled = ref(rulesStore.settings.auto_close_enabled ?? false);
const autoCloseTimeout = ref(rulesStore.settings.auto_close_timeout ?? 30);

const themes = _getThemes();

watch(currentTheme, (theme) => {
	rulesStore.applyTheme(theme);
});

watch(debugModeEnabled, async (enabled) => {
	rulesStore.settings.debug_mode = enabled;
	await rulesStore.save();

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: `Debug Mode ${enabled ? 'enabled' : 'disabled'}!`,
	});
});

watch(lightweightModeEnabled, async (enabled) => {
	rulesStore.settings.lightweight_mode_enabled = enabled;
	await rulesStore.save();

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: `Lightweight Mode ${enabled ? 'enabled' : 'disabled'}!`,
	});
});

watch(lightweightModeApplyToRules, async (enabled) => {
	rulesStore.settings.lightweight_mode_apply_to_rules = enabled;
	await rulesStore.save();
});

watch(lightweightModeApplyToTabHive, async (enabled) => {
	rulesStore.settings.lightweight_mode_apply_to_tab_hive = enabled;
	await rulesStore.save();
});

watch(autoCloseEnabled, async (enabled) => {
	rulesStore.settings.auto_close_enabled = enabled;
	await rulesStore.save();

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: `Auto-Close ${enabled ? 'enabled' : 'disabled'}!`,
	});
});

watch(autoCloseTimeout, async (timeout) => {
	if (timeout < 1) timeout = 1;
	if (timeout > 1440) timeout = 1440;

	rulesStore.settings.auto_close_timeout = timeout;
	await rulesStore.save();
});

const onFileChanged = (event: any) => {
	const file = event.target.files[0];

	if (!file) {
		fileLoaded.value = false;
		return;
	}

	fileLoaded.value = true;
};

const onDeleteAllRules = async () => {
	if (confirm('Are you sure you want to delete all rules?')) {
		await rulesStore.deleteAllRules();

		emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
			type: 'success',
			message: 'All rules have been deleted successfully!',
		});
	}
};

const showImportModal = () => {
	if (!importModal.value) return;

	const modal = importModal.value as HTMLDialogElement;
	modal.showModal();
};

const importMergeConfig = async () => {
	if (!fileInput.value) return;
	if (!fileInput.value.files) return;

	const file = fileInput.value.files[0];
	const reader = new FileReader();

	reader.onload = async (event: any) => {
		try {
			const config = JSON.parse(event.target.result);

			await rulesStore.mergeConfig(config);

			emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
				type: 'success',
				message: 'Import successfully!',
			});

			if (fileInput.value) {
				fileInput.value.value = '';
			}

			if (!importModal.value) return;

			const modal = importModal.value as HTMLDialogElement;
			modal.close();
		} catch (error: any) {
			console.error('Failed to import:', error);

			// Extract meaningful error message
			let errorMessage = 'Failed to import configuration.';
			if (error.message?.includes('quota')) {
				errorMessage =
					'Failed to save data: Storage quota exceeded. This is unexpected - please contact support with your configuration file size.';
			} else if (error instanceof SyntaxError) {
				errorMessage = 'Failed to import: Invalid JSON file format.';
			} else if (error.message) {
				errorMessage = `Failed to import: ${error.message}`;
			}

			emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
				type: 'error',
				message: errorMessage,
			});
		}
	};

	reader.readAsText(file);
};

const importReplaceConfig = async () => {
	if (!fileInput.value) return;
	if (!fileInput.value.files) return;

	if (!confirm('All your current settings will be replaced. Are you sure?')) {
		return;
	}

	const file = fileInput.value.files[0];
	const reader = new FileReader();

	reader.onload = async (event: any) => {
		try {
			const config = JSON.parse(event.target.result);

			await rulesStore.setConfig(config);

			emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
				type: 'success',
				message: 'Import successfully!',
			});

			if (fileInput.value) {
				fileInput.value.value = '';
			}

			if (!importModal.value) return;

			const modal = importModal.value as HTMLDialogElement;
			modal.close();
		} catch (error: any) {
			console.error('Failed to import:', error);

			// Extract meaningful error message
			let errorMessage = 'Failed to import configuration.';
			if (error.message?.includes('quota')) {
				errorMessage =
					'Failed to save data: Storage quota exceeded. This is unexpected - please contact support with your configuration file size.';
			} else if (error instanceof SyntaxError) {
				errorMessage = 'Failed to import: Invalid JSON file format.';
			} else if (error.message) {
				errorMessage = `Failed to import: ${error.message}`;
			}

			emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
				type: 'error',
				message: errorMessage,
			});
		}
	};

	reader.readAsText(file);
};

const exportConfig = async () => {
	const config = await rulesStore.getConfig();

	if (!config) {
		emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
			type: 'error',
			message: 'No config found',
		});

		return;
	}

	const blob = new Blob([JSON.stringify(config, null, 4)], { type: 'text/plain' });
	const url = (window.URL || window.webkitURL).createObjectURL(blob);
	const a = document.createElement('a');

	a.href = url;
	a.download = 'tabee.config.json';
	document.body.appendChild(a);
	a.click();

	document.body.removeChild(a);
	window.URL.revokeObjectURL(url);

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: 'Export successfully!',
	});
};

// Lightweight Mode functions
const showAddPatternModal = () => {
	if (!addPatternModal.value) return;
	addPatternModal.value.showModal();
};

const addPattern = async () => {
	if (!newPattern.value.pattern) return;

	const pattern: LightweightModePattern = {
		id: _generateRandomId(),
		pattern: newPattern.value.pattern,
		type: newPattern.value.type,
		enabled: true,
	};

	lightweightModePatterns.value.push(pattern);
	rulesStore.settings.lightweight_mode_patterns = lightweightModePatterns.value;
	await rulesStore.save();

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: 'Pattern added successfully!',
	});

	// Reset form
	newPattern.value = {
		type: 'domain',
		pattern: '',
	};

	if (addPatternModal.value) {
		addPatternModal.value.close();
	}
};

const deletePattern = async (patternId: string) => {
	if (!confirm('Are you sure you want to delete this pattern?')) return;

	lightweightModePatterns.value = lightweightModePatterns.value.filter((p) => p.id !== patternId);
	rulesStore.settings.lightweight_mode_patterns = lightweightModePatterns.value;
	await rulesStore.save();

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: 'Pattern deleted successfully!',
	});
};

const saveLightweightSettings = async () => {
	rulesStore.settings.lightweight_mode_patterns = lightweightModePatterns.value;
	await rulesStore.save();

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: 'Settings saved!',
	});
};
</script>

<style scoped></style>
