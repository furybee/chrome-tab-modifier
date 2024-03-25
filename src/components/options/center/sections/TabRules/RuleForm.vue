<template>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <pre>{{ rulesStore.currentRule }}</pre>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useRulesStore} from "../../../../../stores/rules.store.ts";

const rulesStore = useRulesStore();
</script>
