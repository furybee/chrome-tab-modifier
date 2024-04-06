<template>
	<div>
		<div v-if="model" class="flex gap-2">
			<div class="form-control flex-0">
				<div class="flex gap-2">
					<CustomSelect
						v-model="model.color"
						:items="availableGroupColors"
						:show-label="false"
						:show-clear-btn="false"
					/>
				</div>
			</div>
			<div class="form-control w-full flex-0">
				<input
					v-model="model.title"
					class="input input-xs input-bordered w-full"
					placeholder="e.g. Google"
					required
					type="text"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import CustomSelect from '../../../../global/CustomSelect.vue';
import { Group } from '../../../../../common/types.ts';
import { _groupColors } from '../../../../../common/helpers.ts';

const model = defineModel<Group>();

const availableGroupColors = _groupColors();
</script>

<style scoped></style>
