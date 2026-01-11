<template>
  <button
    v-motion
    :initial="{ opacity: 0, scale: 0.95 }"
    :enter="{ opacity: 1, scale: 1 }"
    :transition="{ type: 'spring', stiffness: 400, damping: 25 }"
    :while-hover="!isDisabled ? { scale: 1.05 } : {}"
    :while-tap="!isDisabled ? { scale: 0.95 } : {}"
    :disabled="isDisabled"
    :class="[
      'action-button font-serif font-bold tracking-wider uppercase',
      'flex items-center justify-center gap-3 text-center',
      'border-2 rounded-lg transition-all duration-300',
      'disabled:cursor-not-allowed disabled:grayscale disabled:opacity-60',
      fullWidth ? 'w-full' : 'w-auto',
      variantClasses,
      sizeClasses,
    ]"
    @click="$emit('click')"
  >
    <Loader2Icon v-if="loading" class="w-5 h-5 animate-spin" />
    <component v-else-if="icon" :is="icon" class="w-5 h-5" />
    <span class="pt-0.5"><slot /></span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { Loader2 as Loader2Icon } from 'lucide-vue-next';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'magic', 'disabled'].includes(value)
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  fullWidth: { type: Boolean, default: false },
  icon: { type: Object, default: null }
});

defineEmits(['click']);

const isDisabled = computed(() => props.disabled || props.loading);

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-soft-gold/90 border-soft-gold text-text-dark shadow-[0_0_15px_var(--color-soft-gold)] hover:bg-soft-gold',
    secondary: 'bg-glass-surface border-glass-border text-text-light hover:border-cream/80 hover:text-cream',
    danger: 'bg-blood-red/90 border-blood-red text-white shadow-[0_0_15px_var(--color-blood-red)] hover:bg-blood-red',
    magic: 'bg-electric-violet/90 border-electric-violet text-white shadow-[0_0_15px_var(--color-electric-violet)] hover:bg-electric-violet',
    disabled: 'bg-gray-600/50 border-gray-600/50 text-gray-400 cursor-not-allowed'
  };
  return variants[props.variant] || variants.primary;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-10 py-4 text-base'
  };
  return sizes[props.size] || sizes.md;
});
</script>

<style scoped>
.action-button {
  -webkit-tap-highlight-color: transparent;
}

/* Responsive */
@media (max-width: 360px) {
  .action-button {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .action-button {
    transition: none;
  }
}
</style>
