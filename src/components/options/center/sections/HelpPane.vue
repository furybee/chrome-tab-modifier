<template>
	<div class="container mx-auto max-w-5xl p-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">{{ $translate('help_concept_title') }}</h2>
				<p>
					{{ $translate('help_concept_description') }}
				</p>
				<p>{{ $translate('help_data_privacy') }}</p>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">{{ $translate('help_features_title') }}</h2>

				<ul class="list-disc ml-3">
					<li>{{ $translate('help_feature_1') }}</li>
					<li>{{ $translate('help_feature_2') }}</li>
					<li>{{ $translate('help_feature_3') }}</li>
					<li>
						{{ $translate('help_feature_4') }}
						<NewFeature />
					</li>
					<li>{{ $translate('help_feature_5') }}</li>
					<li>{{ $translate('help_feature_6') }}</li>
					<li>{{ $translate('help_feature_7') }}</li>
					<li>{{ $translate('help_feature_8') }}</li>
				</ul>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">{{ $translate('help_tab_rules_title') }}</h2>

				<p>{{ $translate('help_tab_rule_description') }}</p>

				<h3 class="font-bold">{{ $translate('help_rule_name') }}</h3>
				<p>{{ $translate('help_rule_name_description') }}</p>

				<h3 class="font-bold">{{ $translate('help_rule_detection') }}</h3>
				<p>
					{{ $translate('help_rule_detection_description') }}
				</p>

				<h3 class="font-bold">{{ $translate('help_url_fragment') }}</h3>
				<p>
					{{ $translate('help_url_fragment_description') }}
				</p>
				<p class="text-accent">
					{{ $translate('help_rule_core_note') }}
				</p>

				<h3 class="font-bold">{{ $translate('help_action_title') }}</h3>
				<p>{{ $translate('help_action_title_description') }}</p>
				<p>
					{{ $translate('help_title_advanced_usage_1') }}
				</p>
				<p>
					{{ $translate('help_title_advanced_usage_2') }}
				</p>

				<h3 class="font-bold">{{ $translate('help_action_icon') }}</h3>
				<p>{{ $translate('help_action_icon_description') }}</p>
				<p>{{ $translate('help_icon_option_1') }}</p>
				<p>
					{{ $translate('help_icon_option_2') }}
				</p>
				<p>{{ $translate('help_icon_option_3') }}</p>
				<ul class="list-disc ml-3">
					<li>{{ $translate('help_icon_option_3a') }}</li>
					<li>
						{{ $translate('help_icon_option_3b') }}
					</li>
				</ul>

				<h3 class="font-bold">{{ $translate('help_action_group') }}</h3>
				<p>{{ $translate('help_action_group_description') }}</p>

				<h3 class="font-bold">{{ $translate('help_action_pinned') }}</h3>
				<p>{{ $translate('help_action_pinned_description') }}</p>

				<h3 class="font-bold">{{ $translate('help_action_protected') }}</h3>
				<p>{{ $translate('help_action_protected_description') }}</p>
				<p>
					{{ $translate('help_protected_note') }}
				</p>

				<h3 class="font-bold">{{ $translate('help_action_unique') }}</h3>
				<p>
					{{ $translate('help_action_unique_description') }}
				</p>
				<p>
					{{ $translate('help_unique_scenario') }}
				</p>

				<h3 class="font-bold">{{ $translate('help_action_muted') }}</h3>
				<p>{{ $translate('help_action_muted_description') }}</p>
				<p>
					{{ $translate('help_muted_requirement') }}
				</p>

				<h3 class="font-bold">{{ $translate('help_title_matcher') }}</h3>
				<p>
					{{ $translate('help_title_matcher_description') }}
				</p>

				<h3 class="font-bold">{{ $translate('help_url_matcher') }}</h3>
				<p>
					{{ $translate('help_url_matcher_description') }}
				</p>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">{{ $translate('help_additional_notes_title') }}</h2>

				<p>{{ $translate('help_additional_notes_1') }}</p>
				<p>
					{{ $translate('help_additional_notes_2') }}
				</p>
				<p>{{ $translate('help_additional_notes_3') }}</p>

				<hr class="border-base-300" />

				<p class="font-semibold text-primary">
					If you notice any translation errors, feel free to suggest a new translation on our
					<a
						href="https://github.com/furybee/chrome-tab-modifier/issues"
						target="_blank"
						class="text-accent hover:opacity-90"
						>GitHub!</a
					>
				</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import NewFeature from '../../../global/NewFeature.vue';
</script>

<style scoped>
h3 {
	margin-top: 1rem;
}
</style>
