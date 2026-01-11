<template>
  <div
    v-motion
    :initial="{ opacity: 0, scale: 0.9 }"
    :enter="{ opacity: 1, scale: 1 }"
    :transition="{ type: 'spring', stiffness: 350, damping: 30 }"
    :class="[
      'player-card relative w-full rounded-2xl border-2 transition-all duration-300 cursor-pointer',
      cardSize,
      baseClasses,
    ]"
    @click="handleClick"
  >
    <!-- Dead Overlay -->
    <div v-if="isDead" class="dead-overlay absolute inset-0 z-10 rounded-2xl bg-gray-900/70 backdrop-blur-[2px]">
      <div class="stone-texture absolute inset-0 opacity-40"></div>
      <img 
        v-if="crackImageExists" 
        src="/images/effects/crack.svg" 
        alt="Crack" 
        class="absolute inset-0 w-full h-full object-cover opacity-80" 
      />
    </div>

    <!-- Main Content -->
    <div class="relative z-0 flex flex-col items-center justify-center h-full p-3">
      <!-- Player Avatar / Initial -->
      <div class="player-avatar">
        <span class="avatar-initial">{{ getInitials(name) }}</span>
      </div>

      <!-- Badge Hôte (en haut à droite) -->
      <div v-if="isHost" class="badge-host-top">
        <CrownIcon class="badge-icon" />
      </div>

      <!-- Player Name (en bas) -->
      <div class="player-name-container">
        <p class="player-name">{{ name }}</p>
      </div>

      <!-- Badge Prêt (en bas à droite) -->
      <div v-if="isReady && !isDead" class="badge-ready-bottom">
        <CheckIcon class="badge-icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Crown as CrownIcon, Check as CheckIcon } from 'lucide-vue-next';

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
  selectionColor: { type: String, default: 'soft-gold' },
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'small'].includes(value)
  }
});

const emit = defineEmits(['click']);

const isDead = computed(() => props.status === 'dead');
const isReady = computed(() => props.status === 'ready');
const crackImageExists = ref(true);

const cardSize = computed(() => {
  return props.size === 'small' ? 'player-card-small' : 'player-card-normal';
});

const baseClasses = computed(() => {
  if (isDead.value) {
    return 'bg-gray-800/80 border-gray-600 grayscale opacity-60';
  }
  if (props.isSelected) {
    const colorVar = `var(--color-${props.selectionColor})`;
    return `border-${props.selectionColor} shadow-[0_0_15px_${colorVar}] scale-105`;
  }
  if (isReady.value) {
    return 'glass-surface border-green-400/50 hover:border-green-300 hover-lift';
  }
  if (props.isHost) {
    return 'glass-surface border-soft-gold/60 hover:border-soft-gold hover-lift';
  }
  return 'glass-surface border-glass-border hover:border-cream/50 hover-lift';
});

const handleClick = () => {
  if (!isDead.value) {
    emit('click');
  }
};

const getInitials = (name) => {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';
};
</script>

<style scoped>
.player-card {
  background-color: var(--color-glass-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
}

.player-card-normal {
  aspect-ratio: 3 / 4;
}

.player-card-small {
  aspect-ratio: 3 / 4;
  min-height: 60px;
  width: 3rem;
  flex-shrink: 0;
}

.player-card:hover:not(.grayscale) {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(139, 92, 246, 0.3));
  border: 2px solid var(--color-glass-border);
  margin-bottom: auto;
  flex-shrink: 0;
}

.player-card-small .player-avatar {
  width: 2rem;
  height: 2rem;
  border-width: 1px;
}

.avatar-initial {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.player-card-small .avatar-initial {
  font-size: 0.75rem;
}

.player-name-container {
  width: 100%;
  margin-top: auto;
  padding-top: 0.5rem;
  text-align: center;
}

.player-name {
  font-family: var(--font-serif);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-cream);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  width: 100%;
  padding: 0 0.25rem;
  text-align: center;
}

.player-card-small .player-name {
  font-size: 0.625rem;
  padding: 0 0.125rem;
}

.badge-host-top {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(251, 191, 36, 0.95));
  border: 2px solid rgba(254, 243, 199, 0.8);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  z-index: 5;
}

.player-card-small .badge-host-top {
  width: 1rem;
  height: 1rem;
  top: 0.25rem;
  right: 0.25rem;
  border-width: 1px;
}

.badge-ready-bottom {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(74, 222, 128, 0.95));
  border: 2px solid rgba(187, 247, 208, 0.8);
  box-shadow: 0 2px 6px rgba(34, 197, 94, 0.4);
  z-index: 5;
}

.player-card-small .badge-ready-bottom {
  width: 0.875rem;
  height: 0.875rem;
  bottom: 0.25rem;
  right: 0.25rem;
  border-width: 1px;
}

.badge-icon {
  width: 1rem;
  height: 1rem;
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.player-card-small .badge-icon {
  width: 0.5rem;
  height: 0.5rem;
}

.dead-overlay .stone-texture {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
  background-size: 20px 20px;
  background-repeat: repeat;
}

/* Dynamic color handling for selection */
.player-card.border-soft-gold {
  border-color: var(--color-soft-gold);
}

.player-card.border-blood-red {
  border-color: var(--color-blood-red);
}

.player-card.border-electric-violet {
  border-color: var(--color-electric-violet);
}

.player-card.border-neon-cyan {
  border-color: var(--color-neon-cyan);
}

/* Responsive */
@media (max-width: 768px) {
  .player-card {
    font-size: 0.875rem;
  }
  
  .player-name {
    font-size: 0.75rem;
  }
  
  .player-card-small .player-name {
    font-size: 0.5rem;
  }
  
  .player-avatar {
    width: 3rem;
    height: 3rem;
  }
  
  .player-card-small .player-avatar {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .avatar-initial {
    font-size: 1.5rem;
  }
  
  .player-card-small .avatar-initial {
    font-size: 0.625rem;
  }
}

@media (max-width: 360px) {
  .player-card {
    font-size: 0.75rem;
  }
  
  .player-name {
    font-size: 0.625rem;
    padding: 0 0.125rem;
  }
  
  .player-card-small .player-name {
    font-size: 0.4375rem;
  }
  
  .player-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .player-card-small .player-avatar {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .avatar-initial {
    font-size: 1.25rem;
  }
  
  .player-card-small .avatar-initial {
    font-size: 0.5rem;
  }
  
  .badge-host-top {
    width: 1.5rem;
    height: 1.5rem;
    top: 0.375rem;
    right: 0.375rem;
  }
  
  .badge-ready-bottom {
    width: 1.25rem;
    height: 1.25rem;
    bottom: 0.375rem;
    right: 0.375rem;
  }
  
  .badge-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .player-card-small .badge-icon {
    width: 0.4375rem;
    height: 0.4375rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .player-card {
    transition: none;
  }
  
  .hover-lift:hover {
    transform: none;
  }
}
</style>
