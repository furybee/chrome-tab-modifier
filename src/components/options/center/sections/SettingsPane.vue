<template>
	<div class="container mx-auto max-w-5xl p-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">General</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">
							Theme -
							<NewFeature />
						</h3>
						<p>Change Tab Modifier theme</p>
					</div>
					<div class="col-span-1">
						<CustomSelect v-model="currentTheme" :items="themes" :show-clear-btn="false" />
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
				<h2 class="card-title">Backup</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">Import tab rules</h3>
						<p>Restore your tab rules settings from an external JSON file.</p>
					</div>
					<div class="col-span-1">
						<button class="btn btn-sm btn-outline w-full" @click="showImportModal">Import</button>
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
										<button class="btn btn-sm">Close</button>
									</form>

									<button
										:disabled="!fileLoaded"
										class="btn btn-sm btn-outline btn-accent ml-4 group"
										@click="importReplaceConfig"
									>
										Import & Replace
									</button>

									<button
										:disabled="!fileLoaded"
										class="btn btn-sm btn-outline btn-primary ml-4 group"
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
						<button class="btn btn-sm btn-outline w-full" @click="exportConfig">Export</button>
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
						<button class="btn btn-sm btn-error btn-outline w-full" @click="onDeleteAllRules">
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
import NewFeature from '../../../global/NewFeature.vue';
import { GLOBAL_EVENTS } from '../../../../common/types.ts';
import { _getThemes } from '../../../../common/helpers.ts';

const emitter = inject('emitter');

const rulesStore = useRulesStore();

const currentTheme = ref(rulesStore.settings.theme);
const importModal = ref(null);
const fileInput = ref(null);
const fileLoaded = ref(false);

const themes = _getThemes();

watch(currentTheme, (theme) => {
	rulesStore.applyTheme(theme);
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

	const file = fileInput.value.files[0];
	const reader = new FileReader();

	reader.onload = async (event: any) => {
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
	};

	reader.readAsText(file);
};

const importReplaceConfig = async () => {
	if (!fileInput.value) return;

	if (!confirm('All your current settings will be replaced. Are you sure?')) {
		return;
	}

	const file = fileInput.value.files[0];
	const reader = new FileReader();

	reader.onload = async (event: any) => {
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
	a.download = 'tab-modifier.config.json';
	document.body.appendChild(a);
	a.click();

	document.body.removeChild(a);
	window.URL.revokeObjectURL(url);

	emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
		type: 'success',
		message: 'Export successfully!',
	});
};
</script>

<style scoped></style>
