<template>
	<span :style="`background-color: ${props.color};`" class="inline-block h-6 w-6 rounded-full" />
</template>
<script lang="ts" setup>
const props = defineProps<{
	color: string;
}>();
</script>
