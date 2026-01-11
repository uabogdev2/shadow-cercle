<template>
  <div
    v-if="isSystem"
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }"
    :transition="{ duration: 300 }"
    class="chat-bubble-system"
  >
    <div class="system-message">
      <p class="system-text">{{ message }}</p>
    </div>
  </div>
  <div
    v-else
    v-motion
    :initial="{ opacity: 0, y: 10 }"
    :enter="{ opacity: 1, y: 0 }"
    :transition="{ duration: 300 }"
    :class="['chat-bubble', isOwn ? 'chat-bubble-own' : 'chat-bubble-other']"
  >
    <div :class="['bubble', bubbleClasses]">
      <p v-if="!isOwn" class="sender-name" :style="{ color: nameColor }">{{ sender }}</p>
      <p class="message-content">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: { type: String, required: true },
  sender: { type: String, default: null },
  isOwn: { type: Boolean, default: false },
  channel: { type: String, default: 'global' },
  isSystem: { type: Boolean, default: false },
});

const bubbleClasses = computed(() => {
  if (props.isOwn) {
    return 'bubble-own';
  }
  if (props.channel === 'wolves') {
    return 'bubble-wolves';
  }
  if (props.channel === 'dead') {
    return 'bubble-dead';
  }
  if (props.channel === 'lobby') {
    return 'bubble-lobby';
  }
  return 'bubble-default';
});

const nameColor = computed(() => {
  if (props.channel === 'wolves') {
    return '#fca5a5';
  }
  if (props.channel === 'dead') {
    return '#9CA3AF';
  }
  if (props.channel === 'lobby') {
    return '#a5b4fc';
  }
  return '#c4b5fd';
});
</script>

<style scoped>
.chat-bubble {
  display: flex;
  margin-bottom: 0.125rem;
  animation: fadeIn 0.2s ease-in;
}

.chat-bubble-own {
  justify-content: flex-end;
}

.chat-bubble-other {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  min-width: 50px;
  word-wrap: break-word;
  word-break: break-word;
  border-radius: 0.625rem;
  padding: 0.375rem 0.625rem;
  position: relative;
}

.bubble-own {
  background: var(--color-soft-gold);
  color: var(--color-text-dark);
  border-bottom-right-radius: 0.25rem;
}

.bubble-default {
  background: rgba(55, 65, 81, 0.7);
  color: white;
  border-bottom-left-radius: 0.25rem;
}

.bubble-lobby {
  background: rgba(79, 70, 229, 0.6);
  color: white;
  border-bottom-left-radius: 0.25rem;
}

.bubble-wolves {
  background: rgba(127, 29, 29, 0.7);
  color: #fecaca;
  border-bottom-left-radius: 0.25rem;
}

.bubble-dead {
  background: rgba(31, 41, 55, 0.7);
  color: #d1d5db;
  border-bottom-left-radius: 0.25rem;
}

.sender-name {
  font-size: 0.6875rem;
  font-weight: 600;
  font-family: var(--font-sans);
  margin-bottom: 0.1875rem;
  margin-top: 0;
}

.bubble-own .sender-name {
  display: none;
}

.message-content {
  font-size: 0.8125rem;
  font-family: var(--font-sans);
  line-height: 1.35;
  margin: 0;
  word-wrap: break-word;
  word-break: break-word;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-bubble-system {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
}

.system-message {
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 9999px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.system-text {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: rgba(254, 243, 199, 0.6);
  text-align: center;
  margin: 0;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .bubble {
    max-width: 75%;
  }
  
  .system-text {
    font-size: 0.6875rem;
  }
  
  .system-message {
    padding: 0.375rem 0.75rem;
  }
}

@media (max-width: 360px) {
  .bubble {
    max-width: 80%;
    padding: 0.25rem 0.5rem;
  }
  
  .sender-name {
    font-size: 0.625rem;
  }
  
  .message-content {
    font-size: 0.75rem;
  }
  
  .system-text {
    font-size: 0.625rem;
  }
  
  .system-message {
    padding: 0.25rem 0.5rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .chat-bubble {
    animation: none;
  }
}
</style>
