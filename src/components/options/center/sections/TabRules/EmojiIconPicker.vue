<template>
	<div class="relative">
		<!-- Selected icon/emoji display / trigger button -->
		<button
			type="button"
			class="btn btn-sm btn-outline hover:bg-base-300 focus:outline-primary flex items-center gap-2 min-w-[120px] !border-base-content/20"
			@click="isOpen = !isOpen"
		>
			<span v-if="modelValue" class="text-base">{{ displayValue }}</span>
			<span v-else class="text-xs opacity-60">No icon</span>
			<svg
				class="w-4 h-4 ml-auto"
				:class="{ 'rotate-180': isOpen }"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<!-- Emoji/Icon picker dropdown -->
		<div
			v-if="isOpen"
			class="absolute z-50 mt-2 bg-base-100 border border-base-300 rounded-lg shadow-xl w-[310px] h-[300px] flex flex-col"
			@click.stop
		>
			<!-- Search bar -->
			<div class="bg-base-100 p-2 border-b border-base-300">
				<input
					v-model="searchQuery"
					type="text"
					placeholder="Search..."
					class="input input-xs input-bordered w-full"
					@keydown.escape="isOpen = false"
				/>
			</div>

			<!-- Content area -->
			<div class="flex-1 overflow-y-auto p-2 min-h-0">
				<!-- Images tab -->
				<div v-if="currentTab === 'images'" class="grid grid-cols-7 gap-1 place-items-center">
					<button
						v-for="icon in filteredIcons"
						:key="icon.value"
						type="button"
						class="btn btn-xs btn-square btn-ghost hover:bg-base-300 focus:outline-primary focus:outline-2 p-0"
						:class="{ 'bg-base-300': isSelected(icon.value) }"
						:title="icon.label"
						@click="selectItem(icon.value)"
					>
						<img :src="icon.icon" class="w-6 h-6 object-contain" :alt="icon.label" />
					</button>
				</div>

				<!-- Emoji tabs -->
				<div v-else class="grid grid-cols-7 gap-1 place-items-center">
					<button
						v-for="emojiItem in filteredEmojis"
						:key="emojiItem.emoji"
						type="button"
						class="btn btn-xs btn-square btn-ghost hover:bg-base-300 focus:outline-primary focus:outline-2 p-0 text-lg"
						:class="{ 'bg-base-300': isSelected(emojiItem.emoji) }"
						:title="emojiItem.keywords.join(', ')"
						@click="selectItem(emojiItem.emoji)"
					>
						{{ emojiItem.emoji }}
					</button>
				</div>

				<!-- No results -->
				<div v-if="noResults" class="text-center py-8 text-base-content/40 text-xs">
					No results found
				</div>
			</div>

			<!-- Category tabs -->
			<div class="flex gap py-2 border-t bg-base-300 border-base-300 overflow-x-auto">
				<button
					v-for="category in emojiCategories"
					:key="category.id"
					type="button"
					class="btn btn-xs btn-ghost"
					:class="{ 'btn-active': currentTab === category.id }"
					:title="category.name"
					@click="currentTab = category.id"
				>
					<span class="text-base">{{ category.icon }}</span>
				</button>
				<button
					type="button"
					class="btn btn-xs btn-ghost"
					:class="{ 'btn-active': currentTab === 'images' }"
					title="Images"
					@click="currentTab = 'images'"
				>
					<span class="text-base">🖼️</span>
				</button>
			</div>
		</div>

		<!-- Backdrop to close on outside click -->
		<div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { _getIcons } from '../../../../../common/helpers';
import { EMOJI_CATEGORIES } from '../../../../../common/emoji-data';

interface EmojiIconPickerProps {
	modelValue: string | null;
}

const props = defineProps<EmojiIconPickerProps>();
const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const currentTab = ref<string>('smileys'); // Start with first emoji category
const allIcons = ref(_getIcons());
const emojiCategories = ref(EMOJI_CATEGORIES);

// Check if a value is selected
const isSelected = (value: string) => {
	return value === props.modelValue;
};

// Display value (for icons, show emoji; for asset paths, show icon)
const displayValue = computed(() => {
	if (!props.modelValue) return '';

	// If it's an emoji (not a path)
	if (
		props.modelValue.length <= 10 &&
		!props.modelValue.includes('/') &&
		!props.modelValue.startsWith('http')
	) {
		return props.modelValue;
	}

	// If it's an icon path, try to find it
	const icon = allIcons.value.find((i) => i.value === props.modelValue);
	if (icon) {
		return '🖼️'; // Icon placeholder
	}

	return props.modelValue;
});

// Filter icons based on search
const filteredIcons = computed(() => {
	if (!searchQuery.value) return allIcons.value;

	const query = searchQuery.value.toLowerCase();
	return allIcons.value.filter((icon) => icon.label.toLowerCase().includes(query));
});

// Get current category emojis
const currentEmojis = computed(() => {
	const category = emojiCategories.value.find((c) => c.id === currentTab.value);
	return category?.emojis || [];
});

// Filter emojis based on search
const filteredEmojis = computed(() => {
	if (!searchQuery.value) return currentEmojis.value;

	const query = searchQuery.value.toLowerCase();
	return currentEmojis.value.filter((emojiItem) =>
		emojiItem.keywords.some((keyword) => keyword.toLowerCase().includes(query))
	);
});

// Check if no results
const noResults = computed(() => {
	if (currentTab.value === 'images') {
		return filteredIcons.value.length === 0;
	} else {
		return filteredEmojis.value.length === 0;
	}
});

// Select an item
const selectItem = (value: string) => {
	emit('update:modelValue', value);
	isOpen.value = false;
};

// Close on Escape key
const handleKeydown = (e: KeyboardEvent) => {
	if (e.key === 'Escape' && isOpen.value) {
		isOpen.value = false;
	}
};

onMounted(() => {
	document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
	document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Smooth transitions */
.rotate-180 {
	transform: rotate(180deg);
	transition: transform 0.2s ease;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
	width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
	background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
	background: oklch(var(--bc) / 0.2);
	border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	background: oklch(var(--bc) / 0.3);
}

/* Tab scrollbar */
.overflow-x-auto::-webkit-scrollbar {
	height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
	background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
	background: oklch(var(--bc) / 0.2);
	border-radius: 2px;
}
</style>
