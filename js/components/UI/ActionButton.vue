<template>
  <button
    :disabled="isDisabled"
    :class="[
      'eclipse-btn',
      fullWidth ? 'w-full' : 'w-auto',
      variantClasses,
      sizeClasses,
      glowClass,
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-center gap-3">
      <Loader2Icon v-if="loading" class="w-5 h-5 animate-spin" />
      <component v-else-if="icon" :is="icon" class="w-5 h-5" />
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
    validator: (value) => ['primary', 'secondary', 'danger', 'magic', 'gold', 'emerald', 'disabled'].includes(value)
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

defineEmits(['click']);

const isDisabled = computed(() => props.disabled || props.loading);

const variantClasses = computed(() => {
  const variants = {
    primary: `
      bg-gradient-to-r from-amber-500/20 to-yellow-600/10
      border border-amber-500
      text-amber-300
      hover:from-amber-500 hover:to-yellow-600
      hover:text-slate-900
      hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]
    `,
    secondary: `
      bg-slate-800/50
      border border-slate-600
      text-slate-300
      hover:border-slate-400
      hover:text-white
      hover:bg-slate-700/50
    `,
    danger: `
      bg-gradient-to-r from-red-500/20 to-rose-600/10
      border border-red-500
      text-red-400
      hover:from-red-500 hover:to-rose-600
      hover:text-white
      hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]
    `,
    magic: `
      bg-gradient-to-r from-violet-500/20 to-purple-600/10
      border border-violet-500
      text-violet-400
      hover:from-violet-500 hover:to-purple-600
      hover:text-white
      hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]
    `,
    gold: `
      bg-gradient-to-r from-yellow-500/20 to-amber-600/10
      border border-yellow-500
      text-yellow-400
      hover:from-yellow-500 hover:to-amber-500
      hover:text-slate-900
      hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]
    `,
    emerald: `
      bg-gradient-to-r from-emerald-500/20 to-green-600/10
      border border-emerald-500
      text-emerald-400
      hover:from-emerald-500 hover:to-green-600
      hover:text-white
      hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]
    `,
    disabled: `
      bg-slate-800/30
      border border-slate-700
      text-slate-600
      cursor-not-allowed
      pointer-events-none
    `
  };
  return variants[props.variant] || variants.primary;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };
  return sizes[props.size] || sizes.md;
});

const glowClass = computed(() => {
  if (!props.glow || props.disabled) return '';
  const glowColors = {
    primary: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    danger: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    magic: 'shadow-[0_0_20px_rgba(124,58,237,0.3)]',
    gold: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]'
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

.btn-text {
  position: relative;
  z-index: 1;
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
