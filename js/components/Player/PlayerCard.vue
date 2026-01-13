<template>
  <div
    :class="[
      'player-card paper-card frame-wood relative overflow-hidden cursor-pointer transition-all duration-300',
      cardSize,
      baseClasses,
      { 'player-card-dead': isDead },
      { 'player-card-selected': isSelected },
    ]"
    @click="handleClick"
  >
    <!-- Glass Background -->
    <div class="player-card-bg"></div>

    <!-- Selection Glow -->
    <div v-if="isSelected" class="player-card-glow" :class="selectionGlowClass"></div>

    <!-- Dead Overlay -->
    <div v-if="isDead" class="player-card-dead-overlay">
      <div class="player-card-dead-tag">
        <span>Mort</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Top Badge Area -->
      <div class="player-card-top">
        <div v-if="isHost" class="player-card-host">
          <CrownIcon class="w-3 h-3 text-amber-300" />
          <span>Hôte</span>
        </div>
        <div v-else class="w-4"></div>

        <div v-if="isReady && !isDead" class="player-card-ready"></div>
      </div>

      <!-- Avatar Area -->
      <div class="player-card-avatar-wrap">
        <div class="player-card-avatar" :class="avatarBorderClass">
          <div class="player-card-avatar-bg"></div>
          <span class="player-card-avatar-text">{{ getInitials(name) }}</span>
          <div v-if="!isDead" class="player-card-avatar-glow" :class="avatarGlowClass"></div>
        </div>
      </div>

      <!-- Bottom Name Area -->
      <div class="player-card-name">
        <p :class="nameClasses">{{ name }}</p>
        <p v-if="statusLabel" class="player-card-status">{{ statusLabel }}</p>
      </div>
    </div>

    <!-- Selection Indicator Ring -->
    <div v-if="isSelected" class="player-card-ring" :class="selectionBorderClass"></div>

    <!-- Hover Shimmer Effect -->
    <div class="player-card-shimmer">
      <div class="player-card-shimmer-inner"></div>
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
const statusLabel = computed(() => {
  if (isDead.value) return 'Mort';
  if (isReady.value) return 'Prêt';
  if (props.status === 'waiting') return 'En attente';
  return '';
});

const cardSize = computed(() => {
  const sizes = {
    small: 'w-24 h-32',
    normal: 'w-32 h-44',
    large: 'w-40 h-52'
  };
  return sizes[props.size] || sizes.normal;
});

const baseClasses = computed(() => {
  if (isDead.value) return 'border border-[#3a2d2d]/70 rounded-xl grayscale opacity-70';
  if (props.isSelected) return 'border-2 rounded-xl';
  if (isReady.value) return 'border border-emerald-500/50 rounded-xl';
  return 'border border-[#3e2f20]/70 rounded-xl hover:border-[#d97706]/40';
});

const nameClasses = computed(() => {
  const sizes = {
    small: 'text-xs',
    normal: 'text-sm',
    large: 'text-base'
  };
  const sizeClass = sizes[props.size] || sizes.normal;
  const colorClass = isDead.value ? 'text-slate-500 player-card-name-dead' : 'text-[#F5F5DC]';
  return ['font-medium truncate', sizeClass, colorClass].join(' ');
});

const selectionBorderClass = computed(() => {
  const colors = {
    violet: 'border-2 border-[#8B5CF6] shadow-[0_0_18px_rgba(139,92,246,0.45)]',
    red: 'border-2 border-[#991B1B] shadow-[0_0_18px_rgba(153,27,27,0.5)]',
    blue: 'border-2 border-[#1D4ED8] shadow-[0_0_18px_rgba(29,78,216,0.4)]',
    gold: 'border-2 border-[#D97706] shadow-[0_0_18px_rgba(217,119,6,0.5)]',
    emerald: 'border-2 border-[#0F766E] shadow-[0_0_18px_rgba(15,118,110,0.45)]',
    white: 'border-2 border-[#F5F5DC] shadow-[0_0_18px_rgba(245,245,220,0.35)]'
  };
  return colors[props.selectionColor] || colors.violet;
});

const selectionGlowClass = computed(() => {
  const colors = {
    violet: 'bg-[#8B5CF6]/10',
    red: 'bg-[#991B1B]/15',
    blue: 'bg-[#1D4ED8]/10',
    gold: 'bg-[#D97706]/14',
    emerald: 'bg-[#0F766E]/12',
    white: 'bg-white/8'
  };
  return colors[props.selectionColor] || colors.violet;
});

const avatarBorderClass = computed(() => {
  if (isDead.value) return 'border-2 border-slate-600';
  if (props.isSelected) {
    const colors = {
      violet: 'border-2 border-[#8B5CF6]',
      red: 'border-2 border-[#991B1B]',
      blue: 'border-2 border-[#1D4ED8]',
      gold: 'border-2 border-[#D97706]',
      emerald: 'border-2 border-[#0F766E]',
      white: 'border-2 border-[#F5F5DC]'
    };
    return colors[props.selectionColor] || colors.violet;
  }
  if (isReady.value) return 'border-2 border-emerald-500/70';
  return 'border-2 border-slate-500/50';
});

const avatarGlowClass = computed(() => {
  if (props.isSelected) {
    const colors = {
      violet: 'shadow-[0_0_24px_rgba(139,92,246,0.4)]',
      red: 'shadow-[0_0_24px_rgba(153,27,27,0.4)]',
      blue: 'shadow-[0_0_24px_rgba(29,78,216,0.38)]',
      gold: 'shadow-[0_0_24px_rgba(217,119,6,0.4)]',
      emerald: 'shadow-[0_0_24px_rgba(15,118,110,0.4)]'
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

.player-card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, rgba(245, 245, 220, 0.09), rgba(245, 245, 220, 0.02));
  border-radius: 1rem;
  box-shadow: inset 0 0 0 1px rgba(62,47,32,0.35), inset 0 0 24px rgba(0,0,0,0.35);
  overflow: hidden;
}

.player-card-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  opacity: 0.35;
  mix-blend-mode: soft-light;
}

.player-card-glow {
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  pointer-events: none;
}

.player-card-dead-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(20,20,20,0.8), rgba(15,15,15,0.92));
  backdrop-filter: blur(4px);
}

.player-card-dead-tag {
  transform: rotate(-8deg);
  padding: 0.3rem 0.75rem;
  border: 2px solid rgba(153,27,27,0.5);
  background: rgba(127,29,29,0.25);
  text-transform: uppercase;
  color: #FECACA;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.player-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem;
}

.player-card-host {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(217, 119, 6, 0.18);
  border: 1px solid rgba(217, 119, 6, 0.4);
  border-radius: 9999px;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #F5F5DC;
}

.player-card-ready {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: #10B981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
  animation: pulse-ready 1.5s ease-in-out infinite;
}

@keyframes pulse-ready {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.player-card-avatar-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
}

.player-card-avatar {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.player-card-avatar-bg {
  position: absolute;
  inset: 0.2rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, rgba(217,119,6,0.18), rgba(62,47,32,0.6));
}

.player-card-avatar-text {
  position: relative;
  z-index: 1;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: #F5F5DC;
}

.player-card-avatar-glow {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  opacity: 0.35;
}

.player-card-name {
  padding: 0.6rem 0.75rem;
  border-top: 1px solid rgba(62,47,32,0.35);
  background: rgba(0,0,0,0.35);
  text-align: center;
}

.player-card-name p {
  margin: 0;
}

.player-card-status {
  color: #94A3B8;
  font-size: 0.7rem;
  margin-top: 0.15rem;
}

.player-card-ring {
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  pointer-events: none;
}

.player-card-shimmer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.player-card:hover .player-card-shimmer {
  opacity: 1;
}

.player-card-shimmer-inner {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  transform: translateX(-100%);
  animation: shimmer-move 1.2s ease-in-out infinite;
}

@keyframes shimmer-move {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.player-card:hover:not(.player-card-dead) {
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}

.player-card-name-dead {
  text-decoration: line-through;
  opacity: 0.55;
}

.player-card-dead-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(255,255,255,0.06), transparent 50%);
  mix-blend-mode: screen;
}
</style>
