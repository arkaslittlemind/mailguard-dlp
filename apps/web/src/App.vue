<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import { usePoliciesStore } from '@/stores/policies';
import { onMounted } from 'vue';

// Policies are needed app-wide (the composer scans against them live), so load
// them once here.
const policies = usePoliciesStore();
onMounted(() => {
  void policies.fetchAll();
});
</script>

<template>
  <AppHeader />
  <main class="main">
    <RouterView />
  </main>
</template>

<style scoped>
.main {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 20px 64px;
}
</style>
