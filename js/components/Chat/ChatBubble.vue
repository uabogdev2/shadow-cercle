<template>
  <div :class="['flex w-full mb-1', isSystem ? 'justify-center' : (isOwn ? 'justify-end' : 'justify-start')]">

    <!-- System Message -->
    <div v-if="isSystem" class="text-xs text-green-500 font-mono text-center uppercase tracking-widest border-y border-green-900 bg-green-900/10 w-full py-1">
      > {{ message }}
    </div>

    <!-- User Message -->
    <div v-else class="max-w-[80%] flex flex-col">
      <span v-if="!isOwn" class="text-[10px] uppercase font-bold mb-0 ml-1" :style="{ color: nameColor }">
        {{ sender || 'UNKNOWN' }}
      </span>

      <div
        class="p-2 text-sm border font-mono break-words"
        :class="bubbleClasses"
      >
        <span v-if="!isOwn" class="mr-2 opacity-50">></span>
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: { type: String, required: true },
  sender: { type: String, default: null },
  isOwn: { type: Boolean, default: false },
  channel: { type: String, default: 'global' },
  isSystem: { type: Boolean, default: false },
});

const bubbleClasses = computed(() => {
  if (props.isOwn) {
    return 'bg-white text-black border-white';
  }
  // Others
  if (props.channel === 'wolves') {
    return 'bg-red-900/30 text-red-100 border-red-600';
  }
  if (props.channel === 'dead') {
    return 'bg-gray-800 text-gray-400 border-gray-600';
  }
  return 'bg-black text-white border-gray-600';
});

const nameColor = computed(() => {
  if (props.channel === 'wolves') return '#ef4444'; // Red-500
  if (props.channel === 'dead') return '#9ca3af'; // Gray-400
  return '#22d3ee'; // Cyan-400
});
</script>
