<template>
	<div class="w-full">
		<form class="mb-4" @submit.prevent="visualizeRegex">
			<div class="form-control w-full md:flex-0">
				<div class="label">
					<span class="label-text text-xs text-accent">Test string</span>
				</div>

				<div class="flex">
					<input
						id="text"
						v-model="text"
						type="text"
						class="input input-xs input-bordered border-accent w-full"
					/>
				</div>
			</div>
		</form>

		<ul>
			<li v-for="(matchValue, index) in matchValues" :key="index">
				{{ tag }}{{ index }} {{ matchValue }}
			</li>
		</ul>

		<div class="whitespace-pre-wrap text-black" v-html="errorValue"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
	regex: string;
	tag: string;
}>();

const text = ref('');
const errorValue = ref('');
const matchValues = ref<Array<string>>([]);

const visualizeRegex = () => {
	try {
		const regexPattern = new RegExp(props.regex, 'g');
		let matches;
		matchValues.value = [];

		while ((matches = regexPattern.exec(text.value)) !== null) {
			for (let j = 0; j < matches.length; j++) {
				matchValues.value.push(matches[j]);
			}
		}
	} catch (error) {
		errorValue.value = `<span class="text-red-500">Error: ${error.message}</span>`;
	}
};

watch(() => props.regex, visualizeRegex);
watch(() => text.value, visualizeRegex);
</script>
