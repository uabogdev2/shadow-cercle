<!-- js/components/UI/ActionButton.vue -->
<template>
  <button
    :disabled="isDisabled"
    class="btn-brutal min-h-[48px] touch-manipulation flex items-center justify-center gap-2 select-none active:scale-[0.98]"
    :class="[
      fullWidth ? 'w-full' : 'w-auto',
      variantClasses,
      sizeClasses,
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-center gap-2 w-full">
        <Loader2Icon v-if="loading" class="w-5 h-5 animate-spin" />
        <component v-else-if="icon" :is="icon" class="w-5 h-5 flex-shrink-0" />
        <span class="truncate font-bold tracking-wide"><slot /></span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { Loader2 as Loader2Icon } from 'lucide-vue-next';

const props = defineProps({
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  fullWidth: { type: Boolean, default: false },
  icon: { type: Object, default: null }
});

defineEmits(['click']);

const isDisabled = computed(() => props.disabled || props.loading);

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-white text-black border-white hover:bg-gray-200',
    secondary: 'bg-black text-white border-gray-600 hover:border-white',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
    magic: 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700',
    disabled: 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed pointer-events-none'
  };
  return variants[props.variant] || variants.primary;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };
  return sizes[props.size] || sizes.md;
});
</script>
