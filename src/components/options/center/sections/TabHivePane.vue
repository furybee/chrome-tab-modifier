<template>
	<div class="flex justify-center items-start pt-8 pb-20 px-4">
		<div class="w-full max-w-4xl">
			<!-- Tabs Navigation -->
			<div role="tablist" class="tabs tabs-bordered mb-6">
				<a
					role="tab"
					class="tab"
					:class="{ 'tab-active [--tab-border-color:hsl(var(--p))]': activeTab === 'hive' }"
					@click="activeTab = 'hive'"
				>
					🍯 Closed Tabs
				</a>
				<a
					role="tab"
					class="tab"
					:class="{ 'tab-active [--tab-border-color:hsl(var(--p))]': activeTab === 'settings' }"
					@click="activeTab = 'settings'"
				>
					⚙️ Settings & Reject List
				</a>
			</div>

			<!-- Tab Content -->
			<div v-show="activeTab === 'hive'">
				<TabHive />
			</div>

			<div v-show="activeTab === 'settings'">
				<TabHiveSettings />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import TabHive from '../../../TabHive.vue';
import TabHiveSettings from '../../../TabHiveSettings.vue';

const activeTab = ref<'hive' | 'settings'>('hive');
</script>

<style scoped></style>
