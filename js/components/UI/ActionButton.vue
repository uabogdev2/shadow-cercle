<template>
  <button
    :disabled="isDisabled"
    :class="[
      'btn-brutal',
      fullWidth ? 'w-full' : 'w-auto',
      variantClasses,
      sizeClasses,
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-center gap-2">
        <Loader2Icon v-if="loading" class="w-5 h-5 animate-spin" />
        <component v-else-if="icon" :is="icon" class="w-5 h-5" />
        <span><slot /></span>
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
    primary: 'bg-black text-white hover:bg-white hover:text-black border-white',
    secondary: 'bg-black text-gray-300 border-gray-600 hover:border-white hover:text-white',
    danger: 'bg-black text-red-600 border-red-600 hover:bg-red-600 hover:text-black',
    magic: 'bg-black text-purple-500 border-purple-500 hover:bg-purple-500 hover:text-black',
    disabled: 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed pointer-events-none'
  };
  return variants[props.variant] || variants.primary;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base'
  };
  return sizes[props.size] || sizes.md;
});
</script>
