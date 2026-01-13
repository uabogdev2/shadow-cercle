<template>
  <button
    :disabled="isDisabled"
    :class="[
      'folklore-btn',
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
    primary: 'btn-variant-primary',
    secondary: 'btn-variant-secondary',
    danger: 'btn-variant-danger',
    magic: 'btn-variant-magic',
    gold: 'btn-variant-gold',
    emerald: 'btn-variant-emerald',
    neutral: 'btn-variant-neutral',
    ghost: 'btn-variant-ghost',
    disabled: 'btn-variant-disabled'
  };
  return variants[props.variant] || variants.primary;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'btn-size-sm',
    md: 'btn-size-md',
    lg: 'btn-size-lg'
  };
  return sizes[props.size] || sizes.md;
});

const glowClass = computed(() => {
  if (!props.glow || props.disabled) return '';
  const glowColors = {
    primary: 'btn-glow-primary',
    danger: 'btn-glow-danger',
    magic: 'btn-glow-magic',
    gold: 'btn-glow-gold',
    emerald: 'btn-glow-emerald',
    neutral: 'btn-glow-neutral'
  };
  return glowColors[props.variant] || '';
});
</script>

<style scoped>
.folklore-btn {
  position: relative;
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease;
  overflow: hidden;
  border: 2px solid rgba(0, 0, 0, 0.55);
  box-shadow: 0 12px 26px rgba(0,0,0,0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.folklore-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  mix-blend-mode: soft-light;
  opacity: 0.7;
  pointer-events: none;
}

.folklore-btn:focus-visible {
  outline: 2px solid var(--color-accent-paper);
  outline-offset: 2px;
}

.folklore-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.45);
}

.folklore-btn:active:not(:disabled) {
  transform: translateY(0);
}

.folklore-btn:disabled {
  opacity: 0.6;
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

.btn-size-sm { padding: 0.55rem 1.1rem; font-size: 0.7rem; }
.btn-size-md { padding: 0.75rem 1.4rem; font-size: 0.8rem; }
.btn-size-lg { padding: 0.95rem 1.75rem; font-size: 0.9rem; }

.btn-variant-primary {
  background: radial-gradient(circle at 30% 30%, rgba(217, 119, 6, 0.45), rgba(217, 119, 6, 0.2));
  color: var(--color-accent-paper);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
}

.btn-variant-secondary {
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  color: #e2e8f0;
  border-color: rgba(255,255,255,0.1);
}

.btn-variant-danger {
  background: radial-gradient(circle at 30% 30%, rgba(153, 27, 27, 0.55), rgba(127, 29, 29, 0.35));
  color: #fef2f2;
  border-color: rgba(153, 27, 27, 0.5);
}

.btn-variant-magic {
  background: radial-gradient(circle at 30% 30%, rgba(124, 58, 237, 0.45), rgba(59, 7, 100, 0.35));
  color: #ede9fe;
  border-color: rgba(124, 58, 237, 0.4);
}

.btn-variant-gold {
  background: linear-gradient(145deg, rgba(217, 119, 6, 0.55), rgba(180, 83, 9, 0.4));
  color: #0f0f0f;
  border-color: rgba(62, 47, 32, 0.4);
}

.btn-variant-emerald {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.3));
  color: #f0fdfa;
  border-color: rgba(5, 150, 105, 0.4);
}

.btn-variant-neutral {
  background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.25));
  color: #e5e7eb;
  border-color: rgba(255,255,255,0.08);
}

.btn-variant-ghost {
  background: transparent;
  color: #cbd5e1;
  border-color: transparent;
}

.btn-variant-disabled {
  background: rgba(31, 41, 55, 0.4);
  color: #9ca3af;
  cursor: not-allowed;
  border-color: rgba(55, 65, 81, 0.5);
}

.btn-glow-primary { box-shadow: 0 0 22px rgba(217, 119, 6, 0.35); }
.btn-glow-danger { box-shadow: 0 0 22px rgba(153, 27, 27, 0.4); }
.btn-glow-magic { box-shadow: 0 0 22px rgba(124, 58, 237, 0.4); }
.btn-glow-gold { box-shadow: 0 0 22px rgba(217, 119, 6, 0.45); }
.btn-glow-emerald { box-shadow: 0 0 22px rgba(16, 185, 129, 0.35); }
.btn-glow-neutral { box-shadow: 0 0 18px rgba(148, 163, 184, 0.25); }

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
