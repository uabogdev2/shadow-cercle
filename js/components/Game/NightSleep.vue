<!-- NightSleep.vue -->
<template>
  <div class="h-screen w-screen bg-black flex items-center justify-center flex-col">
    <div class="text-center max-w-md p-8 border-2 border-gray-900">
      <h2 class="text-display text-2xl text-gray-800 mb-8">SLEEP MODE ACTIVE</h2>
      <p class="text-mono text-sm text-gray-600 animate-pulse">{{ messages[currentMessageIndex].toUpperCase() }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const messages = [
  "Silence is golden.",
  "Shadows move.",
  "Something is watching.",
  "The wind howls.",
  "Trust no one.",
];

const currentMessageIndex = ref(0);
let messageInterval = null;

onMounted(() => {
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length;
  }, 5000);
});

onUnmounted(() => { if (messageInterval) clearInterval(messageInterval); });
</script>
