<!-- js/components/Player/PlayerCard.vue -->
<template>
  <div
    :class="[
      'relative border transition-all cursor-pointer bg-black text-white overflow-hidden group',
      cardSize,
      baseClasses,
    ]"
    @click="handleClick"
  >
    <!-- Dead Overlay -->
    <div v-if="isDead" class="absolute inset-0 z-20 flex items-center justify-center bg-black/80 pointer-events-none">
      <div class="border border-red-600 px-1 py-0.5 transform -rotate-12 bg-black">
        <span class="text-red-600 font-display text-sm md:text-xl uppercase tracking-widest">DEAD</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Top Bar -->
      <div class="flex justify-between items-start p-1 border-b border-white/20 bg-gray-900/50">
        <span class="text-[8px] font-mono text-gray-500 uppercase truncate max-w-[50%]">ID: {{ getInitials(name) }}</span>
        <div v-if="isHost" class="bg-yellow-600 text-black px-1 text-[8px] font-bold uppercase">HOST</div>
      </div>

      <!-- Avatar Area -->
      <div class="flex-1 flex items-center justify-center bg-black relative min-h-0">
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(#333 1px, transparent 1px); background-size: 8px 8px;"></div>

        <div class="relative w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border border-white bg-gray-800">
          <span class="font-display text-lg md:text-2xl">{{ getInitials(name) }}</span>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="p-1 border-t border-white/20 bg-gray-900/50 flex justify-between items-center h-8 md:h-10">
        <p class="font-mono text-[10px] md:text-xs truncate w-full uppercase text-center leading-tight">{{ name }}</p>
        <div v-if="isReady && !isDead" class="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500 animate-pulse"></div>
      </div>
    </div>

    <!-- Selection Indicator -->
    <div v-if="isSelected" class="absolute inset-0 border-2 border-white z-30 pointer-events-none shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  avatar: { type: String, default: null },
  status: { type: String, default: 'waiting' },
  isHost: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  selectionColor: { type: String, default: 'white' },
  size: { type: String, default: 'normal' }
});

const emit = defineEmits(['click']);

const isDead = computed(() => props.status === 'dead');
const isReady = computed(() => props.status === 'ready');

const cardSize = computed(() => {
  return props.size === 'small' ? 'w-full aspect-[3/4] min-w-[60px]' : 'w-full aspect-[3/4] min-w-[80px]';
});

const baseClasses = computed(() => {
  if (isDead.value) return 'border-gray-800 grayscale opacity-50';
  if (props.isSelected) return 'border-white bg-gray-900';
  if (isReady.value) return 'border-green-800 hover:border-green-500';
  return 'border-gray-800 hover:border-gray-500';
});

const handleClick = () => {
  if (!isDead.value) emit('click');
};

const getInitials = (name) => {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
};
</script>
