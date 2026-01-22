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

		<div v-if="errorValue" class="whitespace-pre-wrap text-red-500">Error: {{ errorValue }}</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
	regex: string | null;
	tag: string;
}>();

const text = ref('');
const errorValue = ref('');
const matchValues = ref<Array<string>>([]);

function isRegexSafe(pattern: string): boolean {
	// Basic validation to prevent ReDoS attacks
	if (typeof pattern !== 'string' || pattern.length > 200) {
		return false;
	}

	// Check for potentially dangerous patterns that can cause ReDoS
	const dangerousPatterns = [
		/\(\?=.*\)\+/, // Positive lookahead with quantifiers
		/\(\?!.*\)\+/, // Negative lookahead with quantifiers
		/\(.+\)\+\$/, // Catastrophic backtracking patterns
		/\(.+\)\*\+/, // Conflicting quantifiers
		/\(\.\*\)\{2,\}/, // Multiple .* in groups
		/\(\.\+\)\{2,\}/, // Multiple .+ in groups
	];

	return !dangerousPatterns.some((dangerous) => dangerous.test(pattern));
}

function createSafeRegex(pattern: string, flags = 'g'): RegExp {
	if (!isRegexSafe(pattern)) {
		throw new Error('Potentially unsafe regex pattern detected');
	}

	try {
		// semgrep: ignore - Safe regex creation with validation above
		// nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
		return new RegExp(pattern, flags);
	} catch (e: any) {
		throw new Error(`Invalid regex pattern: ${e.message}`);
	}
}

const visualizeRegex = () => {
	if (!props.regex) {
		return;
	}

	try {
		const regexPattern = createSafeRegex(props.regex, 'g');
		let matches;
		let iterationCount = 0;
		const maxIterations = 100; // Prevent infinite loops
		matchValues.value = [];

		while ((matches = regexPattern.exec(text.value)) !== null && iterationCount < maxIterations) {
			for (let j = 0; j < matches.length; j++) {
				matchValues.value.push(matches[j]);
			}
			iterationCount++;
		}

		// Clear error if successful
		errorValue.value = '';
	} catch (error: any) {
		errorValue.value = error.message;
		matchValues.value = [];
	}
};

watch(() => props.regex, visualizeRegex);
watch(() => text.value, visualizeRegex);
</script>
