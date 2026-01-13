<template>
  <div
    :class="[
      'player-card relative overflow-hidden cursor-pointer transition-all duration-300',
      cardSize,
      baseClasses,
      { 'player-card-dead': isDead },
      { 'player-card-selected': isSelected },
    ]"
    @click="handleClick"
  >
    <!-- Glass Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-sm"></div>
    
    <!-- Neon Border Glow (when selected) -->
    <div 
      v-if="isSelected" 
      class="absolute inset-0 pointer-events-none"
      :class="selectionGlowClass"
    ></div>

    <!-- Dead Overlay -->
    <div v-if="isDead" class="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div class="transform -rotate-12 px-3 py-1 border-2 border-red-500/60 bg-red-950/50">
        <span class="text-red-400 font-display text-sm uppercase tracking-widest">Mort</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Top Badge Area -->
      <div class="flex justify-between items-start p-2">
        <!-- Host Crown -->
        <div 
          v-if="isHost" 
          class="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded-full"
        >
          <CrownIcon class="w-3 h-3 text-amber-400" />
          <span class="text-[10px] text-amber-400 font-medium uppercase">Hôte</span>
        </div>
        <div v-else class="w-4"></div>
        
        <!-- Ready Indicator -->
        <div 
          v-if="isReady && !isDead" 
          class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        ></div>
      </div>

      <!-- Avatar Area -->
      <div class="flex-1 flex items-center justify-center px-2 py-3">
        <div 
          class="relative w-14 h-14 rounded-full flex items-center justify-center"
          :class="avatarBorderClass"
        >
          <!-- Avatar Background with gradient -->
          <div class="absolute inset-1 rounded-full bg-gradient-to-br from-slate-700 to-slate-800"></div>
          
          <!-- Initial or Icon -->
          <span class="relative z-10 font-display text-2xl text-white">
            {{ getInitials(name) }}
          </span>
          
          <!-- Glow effect for avatar -->
          <div 
            v-if="!isDead" 
            class="absolute inset-0 rounded-full opacity-30"
            :class="avatarGlowClass"
          ></div>
        </div>
      </div>

      <!-- Bottom Name Area -->
      <div class="p-2 border-t border-white/10 bg-black/20">
        <p 
          class="text-center font-medium truncate"
          :class="[
            isDead ? 'text-slate-500' : 'text-slate-200',
            size === 'small' ? 'text-xs' : 'text-sm'
          ]"
        >
          {{ name }}
        </p>
      </div>
    </div>

    <!-- Selection Indicator Ring -->
    <div 
      v-if="isSelected" 
      class="absolute inset-0 rounded-xl pointer-events-none"
      :class="selectionBorderClass"
    ></div>

    <!-- Hover Shimmer Effect -->
    <div class="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Crown as CrownIcon } from 'lucide-vue-next';

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
  selectionColor: { type: String, default: 'violet' },
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'small', 'large'].includes(value)
  }
});

const emit = defineEmits(['click']);

const isDead = computed(() => props.status === 'dead');
const isReady = computed(() => props.status === 'ready');

const cardSize = computed(() => {
  const sizes = {
    small: 'w-24 h-32',
    normal: 'w-32 h-44',
    large: 'w-40 h-52'
  };
  return sizes[props.size] || sizes.normal;
});

const baseClasses = computed(() => {
  if (isDead.value) return 'border border-slate-700/50 rounded-xl grayscale opacity-60';
  if (props.isSelected) return 'border-2 rounded-xl';
  if (isReady.value) return 'border border-emerald-500/50 rounded-xl';
  return 'border border-slate-600/30 rounded-xl hover:border-slate-500/50';
});

const selectionBorderClass = computed(() => {
  const colors = {
    violet: 'border-2 border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.5)]',
    red: 'border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    blue: 'border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    gold: 'border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    emerald: 'border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    white: 'border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
  };
  return colors[props.selectionColor] || colors.violet;
});

const selectionGlowClass = computed(() => {
  const colors = {
    violet: 'bg-violet-500/10',
    red: 'bg-red-500/10',
    blue: 'bg-blue-500/10',
    gold: 'bg-amber-500/10',
    emerald: 'bg-emerald-500/10',
    white: 'bg-white/5'
  };
  return colors[props.selectionColor] || colors.violet;
});

const avatarBorderClass = computed(() => {
  if (isDead.value) return 'border-2 border-slate-600';
  if (props.isSelected) {
    const colors = {
      violet: 'border-2 border-violet-500',
      red: 'border-2 border-red-500',
      blue: 'border-2 border-blue-500',
      gold: 'border-2 border-amber-500',
      emerald: 'border-2 border-emerald-500',
      white: 'border-2 border-white'
    };
    return colors[props.selectionColor] || colors.violet;
  }
  if (isReady.value) return 'border-2 border-emerald-500/70';
  return 'border-2 border-slate-500/50';
});

const avatarGlowClass = computed(() => {
  if (props.isSelected) {
    const colors = {
      violet: 'shadow-[0_0_20px_rgba(124,58,237,0.4)]',
      red: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
      blue: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      gold: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]'
    };
    return colors[props.selectionColor] || '';
  }
  return '';
});

const handleClick = () => {
  if (!isDead.value) emit('click');
};

const getInitials = (name) => {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
};
</script>

<style scoped>
.player-card {
  transform-style: preserve-3d;
  perspective: 1000px;
}

.player-card:hover:not(.player-card-dead) {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.player-card-selected {
  transform: translateY(-2px) scale(1.02);
}

.player-card-dead {
  cursor: default;
}
</style>
