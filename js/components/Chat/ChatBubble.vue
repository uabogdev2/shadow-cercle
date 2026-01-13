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
  if (props.isOwn) return 'bubble bubble-own';
  if (props.channel === 'wolves') return 'bubble bubble-wolves';
  if (props.channel === 'dead') return 'bubble bubble-dead';
  return 'bubble bubble-other';
});

const nameColor = computed(() => {
  if (props.channel === 'wolves') return '#f87171';
  if (props.channel === 'dead') return '#94a3b8';
  return '#f59e0b';
});
</script>

<style scoped>
.message-bubble {
  max-width: 100%;
  word-wrap: break-word;
  line-height: 1.4;
}

.bubble {
  border-radius: 18px;
  border: 1px solid rgba(226, 194, 144, 0.28);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
}

.bubble-own {
  background: linear-gradient(150deg, #0f1624 0%, #0b101b 100%);
  border-color: rgba(124, 58, 237, 0.32);
  color: #e4e7ed;
  box-shadow: 0 14px 40px rgba(124, 58, 237, 0.25), 0 2px 0 rgba(226, 194, 144, 0.12);
}

.bubble-other {
  background: linear-gradient(145deg, #f3e0b8 0%, #e2c892 100%);
  color: #2a2112;
  border-color: rgba(181, 138, 76, 0.45);
  box-shadow: 0 14px 32px rgba(88, 63, 26, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.bubble-wolves {
  background: linear-gradient(145deg, #2a0f12 0%, #3a161a 100%);
  color: #f7d8d3;
  border-color: rgba(248, 113, 113, 0.4);
  box-shadow: 0 14px 36px rgba(120, 17, 20, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.bubble-dead {
  background: linear-gradient(145deg, #2a2f38 0%, #1e222b 100%);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.35);
  box-shadow: 0 12px 30px rgba(15, 18, 24, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
</style>
