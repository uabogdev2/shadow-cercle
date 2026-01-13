<template>
  <button
    :disabled="isDisabled"
    :class="[
      'eclipse-btn',
      fullWidth ? 'w-full' : 'w-auto',
      variantClasses,
      sizeClasses,
      glowClass,
      loading ? 'btn-loading' : ''
    ]"
    @click="handleClick"
  >
    <div class="action-button-content">
      <Loader2Icon v-if="loading" class="action-button-icon action-button-icon-spin" />
      <component v-else-if="icon" :is="icon" class="action-button-icon" />
      <span class="btn-text"><slot /></span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { Loader2 as Loader2Icon } from 'lucide-vue-next';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'magic', 'gold', 'emerald', 'neutral', 'ghost', 'disabled'].includes(value)
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  fullWidth: { type: Boolean, default: false },
  icon: { type: Object, default: null },
  glow: { type: Boolean, default: false }
});

const emit = defineEmits(['click']);

const isDisabled = computed(() => props.disabled || props.loading);

function handleClick(event) {
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
  emit('click', event);
}

const variantClasses = computed(() => {
  const variants = {
    primary: `
      bg-gradient-to-r from-[#F59E0B]/25 to-[#F59E0B]/15
      border border-[#F59E0B]
      text-[#FCD34D]
      hover:from-[#F59E0B] hover:to-[#D97706]
      hover:text-[#0F172A]
      hover:shadow-[0_10px_30px_rgba(245,158,11,0.35)]
      active:scale-98
    `,
    secondary: `
      bg-white/5
      border border-white/10
      text-slate-200
      hover:border-white/30
      hover:text-white
      hover:bg-white/10
    `,
    danger: `
      bg-gradient-to-r from-[#EF4444]/25 to-[#EF4444]/10
      border border-[#EF4444]
      text-[#FCA5A5]
      hover:from-[#EF4444] hover:to-[#B91C1C]
      hover:text-white
      hover:shadow-[0_10px_30px_rgba(239,68,68,0.35)]
    `,
    magic: `
      bg-gradient-to-r from-[#7C3AED]/25 to-[#7C3AED]/10
      border border-[#7C3AED]
      text-[#A78BFA]
      hover:from-[#7C3AED] hover:to-[#5B21B6]
      hover:text-white
      hover:shadow-[0_10px_30px_rgba(124,58,237,0.35)]
    `,
    gold: `
      bg-gradient-to-r from-[#FBBF24]/25 to-[#F59E0B]/15
      border border-[#FBBF24]
      text-[#FDE68A]
      hover:from-[#FBBF24] hover:to-[#D97706]
      hover:text-[#0F172A]
      hover:shadow-[0_10px_30px_rgba(251,191,36,0.35)]
    `,
    emerald: `
      bg-gradient-to-r from-[#10B981]/25 to-[#10B981]/10
      border border-[#10B981]
      text-[#6EE7B7]
      hover:from-[#10B981] hover:to-[#0F766E]
      hover:text-white
      hover:shadow-[0_10px_30px_rgba(16,185,129,0.35)]
    `,
    neutral: `
      bg-slate-800/60
      border border-slate-700
      text-slate-200
      hover:border-slate-500
      hover:bg-slate-700/60
    `,
    ghost: `
      bg-transparent
      border border-transparent
      text-slate-300
      hover:border-white/20
      hover:bg-white/5
    `,
    disabled: `
      bg-slate-800/30
      border border-slate-700
      text-slate-600
      cursor: not-allowed
      pointer-events-none
    `
  };
  return variants[props.variant] || variants.primary;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-md',
    md: 'px-6 py-3 text-sm rounded-lg',
    lg: 'px-8 py-4 text-base rounded-xl'
  };
  return sizes[props.size] || sizes.md;
});

const glowClass = computed(() => {
  if (!props.glow || props.disabled) return '';
  const glowColors = {
    primary: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
    danger: 'shadow-[0_0_25px_rgba(239,68,68,0.35)]',
    magic: 'shadow-[0_0_25px_rgba(124,58,237,0.35)]',
    gold: 'shadow-[0_0_25px_rgba(251,191,36,0.35)]',
    emerald: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    neutral: 'shadow-[0_0_20px_rgba(148,163,184,0.25)]'
  };
  return glowColors[props.variant] || '';
});
</script>

<style scoped>
.eclipse-btn {
  position: relative;
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow: hidden;
}

.eclipse-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.eclipse-btn:hover:not(:disabled)::before {
  opacity: 1;
  animation: shimmer 1.5s ease-in-out infinite;
}

.eclipse-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.eclipse-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-loading {
  cursor: progress;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.action-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.action-button-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.action-button-icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}
</style>
