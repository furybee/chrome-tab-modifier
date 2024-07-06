<template>
	<div class="container mx-auto max-w-5xl p-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">{{ translate('settings_general_title') }}</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">
							{{ translate('settings_theme') }} -
							<NewFeature />
						</h3>
						<p>{{ translate('settings_change_theme') }}</p>
					</div>
					<div class="col-span-1">
						<CustomSelect v-model="currentTheme" :items="themes" :show-clear-btn="false" />
					</div>
				</div>

				<div class="grid grid-cols-6 mt-4">
					<div class="col-span-5">
						<h3 class="font-bold">
							{{ translate('settings_locale') }} -
							<NewFeature />
						</h3>
						<p>{{ translate('settings_change_locale') }}</p>
					</div>
					<div class="col-span-1">
						<CustomSelect v-model="currentLocale" :items="locales" :show-clear-btn="false" />
					</div>
				</div>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">{{ translate('settings_backup_title') }}</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">{{ translate('settings_import_tab_rules') }}</h3>
						<p>{{ translate('settings_restore_tab_rules') }}</p>
					</div>
					<div class="col-span-1">
						<button class="btn btn-sm btn-outline w-full" @click="showImportModal">
							{{ translate('settings_import') }}
						</button>
						<dialog ref="importModal" class="modal">
							<div class="modal-box">
								<h3 class="font-bold text-lg">{{ translate('settings_import') }}</h3>
								<p>{{ translate('settings_import_tab_rules') }}</p>

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
										<button class="btn btn-sm">{{ translate('settings_close') }}</button>
									</form>

									<button
										:disabled="!fileLoaded"
										class="btn btn-sm btn-outline btn-accent ml-4 group"
										@click="importReplaceConfig"
									>
										{{ translate('settings_import_replace') }}
									</button>

									<button
										:disabled="!fileLoaded"
										class="btn btn-sm btn-outline btn-primary ml-4 group"
										@click="importMergeConfig"
									>
										{{ translate('settings_import_merge') }}
									</button>
								</div>
							</div>
						</dialog>
					</div>
				</div>

				<div class="grid grid-cols-6 mt-4">
					<div class="col-span-5">
						<h3 class="font-bold">{{ translate('settings_export_tab_rules') }}</h3>
						<p>{{ translate('settings_export_tab_rules_description') }}</p>
					</div>
					<div class="col-span-1">
						<button class="btn btn-sm btn-outline w-full" @click="exportConfig">
							{{ translate('settings_export') }}
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="card bg-base-200 border border-error mt-4">
			<div class="card-body">
				<h2 class="card-title text-error">{{ translate('settings_danger_zone') }}</h2>

				<div class="grid grid-cols-6">
					<div class="col-span-5">
						<h3 class="font-bold">{{ translate('settings_delete_all_rules') }}</h3>
						<p>{{ translate('settings_delete_all_rules_warning') }}</p>
					</div>
					<div class="col-span-1">
						<button class="btn btn-sm btn-error btn-outline w-full" @click="onDeleteAllRules">
							{{ translate('settings_delete') }}
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
import { _getLocales, _getThemes, translate } from '../../../../common/helpers.ts';
import { _setLocale, globalLocale } from '../../../../common/storage.ts';

const emitter: any = inject('emitter');

const rulesStore = useRulesStore();

const currentTheme = ref(rulesStore.settings.theme);
const currentLocale = ref(globalLocale ?? 'en');
const importModal = ref(null);
const fileInput = ref<HTMLInputElement | null>(null);
const fileLoaded = ref(false);

const themes = _getThemes();
const locales = _getLocales();

watch(currentTheme, (theme) => {
	rulesStore.applyTheme(theme);
});

watch(currentLocale, (locale) => {
	_setLocale(locale);
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
	if (confirm(translate('settings_delete_all_rules_confirm'))) {
		await rulesStore.deleteAllRules();

		emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
			type: 'success',
			message: translate('settings_delete_all_rules_success'),
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
		const config = JSON.parse(event.target.result);

		await rulesStore.mergeConfig(config);

		emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
			type: 'success',
			message: translate('settings_import_success'),
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
	if (!fileInput.value.files) return;

	if (!confirm(translate('settings_replace_settings_confirm'))) {
		return;
	}

	const file = fileInput.value.files[0];
	const reader = new FileReader();

	reader.onload = async (event: any) => {
		const config = JSON.parse(event.target.result);

		await rulesStore.setConfig(config);

		emitter.emit(GLOBAL_EVENTS.SHOW_TOAST, {
			type: 'success',
			message: translate('settings_import_success'),
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
			message: translate('settings_no_config_found'),
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
		message: translate('settings_export_success'),
	});
};
</script>

<style scoped></style>
