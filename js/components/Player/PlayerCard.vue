<template>
  <div
    :class="[
      'relative border-2 transition-all cursor-pointer bg-black text-white overflow-hidden group',
      cardSize,
      baseClasses,
    ]"
    @click="handleClick"
  >
    <!-- Dead Overlay -->
    <div v-if="isDead" class="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
      <div class="border-2 border-red-600 px-2 py-1 transform -rotate-12 bg-black">
        <span class="text-red-600 font-display text-xl uppercase tracking-widest">DECEASED</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Top Bar -->
      <div class="flex justify-between items-start p-2 border-b-2 border-white/20 bg-gray-900">
        <span class="text-[10px] font-mono text-gray-500 uppercase">ID: {{ getInitials(name) }}</span>
        <div v-if="isHost" class="bg-yellow-600 text-black px-1 text-[10px] font-bold uppercase">HOST</div>
      </div>

      <!-- Avatar Area -->
      <div class="flex-1 flex items-center justify-center bg-black relative">
        <!-- Grid pattern background -->
        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#333 1px, transparent 1px); background-size: 10px 10px;"></div>

        <div class="relative w-12 h-12 flex items-center justify-center border-2 border-white bg-gray-800">
          <span class="font-display text-2xl">{{ getInitials(name) }}</span>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="p-2 border-t-2 border-white/20 bg-gray-900 flex justify-between items-center">
        <p class="font-mono text-xs truncate max-w-[80px] uppercase">{{ name }}</p>
        <div v-if="isReady && !isDead" class="w-2 h-2 bg-green-500 animate-pulse"></div>
      </div>
    </div>

    <!-- Selection Indicator -->
    <div v-if="isSelected" class="absolute inset-0 border-4 border-white z-30 pointer-events-none"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  avatar: { type: String, default: null },
  status: {
    type: String,
    default: 'waiting',
    validator: (value) => ['alive', 'dead', 'ready', 'waiting'].includes(value)
  },
  isHost: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  selectionColor: { type: String, default: 'white' },
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'small'].includes(value)
  }
});

const emit = defineEmits(['click']);

const isDead = computed(() => props.status === 'dead');
const isReady = computed(() => props.status === 'ready');

const cardSize = computed(() => {
  return props.size === 'small' ? 'w-24 h-32' : 'w-32 h-44';
});

const baseClasses = computed(() => {
  if (isDead.value) return 'border-gray-700 grayscale opacity-75';
  if (props.isSelected) return 'border-white';
  if (isReady.value) return 'border-green-500';
  return 'border-gray-600 hover:border-white';
});

const handleClick = () => {
  if (!isDead.value) emit('click');
};

const getInitials = (name) => {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
};
</script>
