<template>
  <div :class="['flex w-full mb-2', isSystem ? 'justify-center' : (isOwn ? 'justify-end' : 'justify-start')]">

    <!-- System Message -->
    <div v-if="isSystem" class="w-full px-4 py-2">
      <div class="flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-wider">
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
        <span class="text-emerald-400/80">{{ message }}</span>
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      </div>
    </div>

    <!-- User Message -->
    <div v-else class="max-w-[85%] flex flex-col" :class="isOwn ? 'items-end' : 'items-start'">
      <!-- Sender name (only for others) -->
      <span 
        v-if="!isOwn" 
        class="text-[11px] font-medium mb-1 ml-3 opacity-80"
        :style="{ color: nameColor }"
      >
        {{ sender || 'Unknown' }}
      </span>

      <!-- Message Bubble -->
      <div
        class="message-bubble px-4 py-2 text-sm break-words"
        :class="bubbleClasses"
      >
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
    return `
      bg-gradient-to-br from-violet-600 to-indigo-700
      text-white
      rounded-2xl rounded-br-md
      shadow-lg shadow-violet-500/20
    `;
  }
  // Others - different channels
  if (props.channel === 'wolves') {
    return `
      bg-gradient-to-br from-red-900/60 to-rose-900/40
      backdrop-blur-sm
      text-red-100
      border border-red-500/30
      rounded-2xl rounded-bl-md
      shadow-lg shadow-red-500/10
    `;
  }
  if (props.channel === 'dead') {
    return `
      bg-slate-800/60
      backdrop-blur-sm
      text-slate-400
      border border-slate-600/30
      rounded-2xl rounded-bl-md
    `;
  }
  // Default (global/lobby)
  return `
    bg-slate-800/60
    backdrop-blur-sm
    text-slate-200
    border border-slate-600/30
    rounded-2xl rounded-bl-md
  `;
});

const nameColor = computed(() => {
  if (props.channel === 'wolves') return '#f87171'; // Red-400
  if (props.channel === 'dead') return '#94a3b8'; // Slate-400
  return '#38bdf8'; // Sky-400
});
</script>

<style scoped>
.message-bubble {
  max-width: 100%;
  word-wrap: break-word;
  line-height: 1.4;
}
</style>
