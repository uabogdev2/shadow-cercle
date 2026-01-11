<template>
  <div v-if="isVisible" class="chat-container">
    <!-- Header -->
    <header class="chat-header">
      <h3 class="chat-title">{{ channelName }}</h3>
    </header>

    <!-- Messages Area -->
    <div class="messages-area" ref="messagesContainer">
      <ChatBubble
        v-for="message in messages"
        :key="message.id"
        :message="message.content"
        :sender="message.user?.name"
        :is-own="message.user_id === currentUserId"
        :channel="channel"
        :is-system="message.is_system || false"
      />
    </div>
    
    <!-- Footer -->
    <footer class="chat-footer">
      <!-- Quick Reaction Buttons (Phase Débat uniquement) -->
      <div 
        v-if="showQuickReactions" 
        class="quick-reactions"
      >
        <button
          v-for="reaction in quickReactions"
          :key="reaction.emoji"
          @click="sendQuickReaction(reaction.emoji)"
          class="quick-reaction-btn"
          :disabled="cooldownRemaining > 0"
          :title="cooldownRemaining > 0 ? `Attendez ${cooldownRemaining}s...` : reaction.label"
        >
          {{ reaction.emoji }}
        </button>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          :placeholder="cooldownRemaining > 0 ? `Attendez ${cooldownRemaining}s...` : 'Votre message...'"
          :disabled="cooldownRemaining > 0"
          class="chat-input"
        />
        <button 
          @click="sendMessage" 
          :disabled="!newMessage.trim() || cooldownRemaining > 0 || isSending" 
          class="send-button"
          :title="cooldownRemaining > 0 ? `Attendez ${cooldownRemaining} seconde(s)` : 'Envoyer le message'"
          aria-label="Envoyer le message"
        >
          <Send class="send-icon" />
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { Send } from 'lucide-vue-next';
import ChatBubble from './ChatBubble.vue';

const props = defineProps({
  channel: {
    type: String,
    required: true,
    validator: (value) => ['lobby', 'global', 'wolves', 'dead'].includes(value)
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
  showQuickReactions: {
    type: Boolean,
    default: false,
  },
});

const gameStore = useGameStore();
const authStore = useAuthStore();
const newMessage = ref('');
const messages = ref([]);
const messagesContainer = ref(null);
const isSending = ref(false);
const cooldownRemaining = ref(0);
const cooldownInterval = ref(null);

const currentUserId = computed(() => authStore.user?.id);

const channelName = computed(() => {
  const names = {
    lobby: 'Chat du Lobby',
    global: 'Agora du Village',
    wolves: 'Horde des Loups',
    dead: 'Le Cimetière',
  };
  return names[props.channel] || 'Chat';
});

const quickReactions = [
  { emoji: '🤔', label: 'Pensif' },
  { emoji: '🐺', label: 'Loup' },
  { emoji: '🛡️', label: 'Protection' },
  { emoji: '☝️', label: 'Point important' },
];

async function loadMessages() {
  if (!gameStore.currentGame) return;
  try {
    const response = await axios.get(`/games/${gameStore.currentGame.id}/messages/${props.channel}`);
    const loadedMessages = response.data.messages || [];
    // Ajouter le channel à chaque message
    messages.value = loadedMessages.map(msg => ({
      ...msg,
      channel: props.channel
    }));
    scrollToBottom();
  } catch (error) {
    console.error('Error loading messages:', error);
    // Si l'endpoint n'existe pas, initialiser un tableau vide
    messages.value = [];
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !gameStore.currentGame || isSending.value || cooldownRemaining.value > 0) return;
  
  isSending.value = true;
  try {
    await axios.post(`/games/${gameStore.currentGame.id}/messages`, {
      content: newMessage.value,
      channel: props.channel
    });
    newMessage.value = '';
    
    // Démarrez le cooldown de 10 secondes
    startCooldown(10);
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Si c'est une erreur 429 (rate limit), utiliser le cooldown du serveur
    if (error.response?.status === 429) {
      const cooldown = error.response?.data?.cooldown_remaining || 10;
      startCooldown(cooldown);
      
      if (window.showNotification) {
        window.showNotification(error.response?.data?.message || 'Veuillez attendre avant d\'envoyer un nouveau message', 'warning');
      }
    }
  } finally {
    isSending.value = false;
  }
}

function startCooldown(seconds) {
  cooldownRemaining.value = seconds;
  
  // Nettoyer l'intervalle précédent s'il existe
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value);
  }
  
  cooldownInterval.value = setInterval(() => {
    cooldownRemaining.value--;
    if (cooldownRemaining.value <= 0) {
      clearInterval(cooldownInterval.value);
      cooldownInterval.value = null;
    }
  }, 1000);
}

async function sendQuickReaction(emoji) {
  if (!gameStore.currentGame || isSending.value || cooldownRemaining.value > 0) return;
  
  isSending.value = true;
  try {
    await axios.post(`/games/${gameStore.currentGame.id}/messages`, {
      content: emoji,
      channel: props.channel
    });
    
    // Démarrez le cooldown de 10 secondes
    startCooldown(10);
  } catch (error) {
    console.error('Error sending quick reaction:', error);
    
    // Si c'est une erreur 429 (rate limit), utiliser le cooldown du serveur
    if (error.response?.status === 429) {
      const cooldown = error.response?.data?.cooldown_remaining || 10;
      startCooldown(cooldown);
      
      if (window.showNotification) {
        window.showNotification(error.response?.data?.message || 'Veuillez attendre avant d\'envoyer un nouveau message', 'warning');
      }
    }
  } finally {
    isSending.value = false;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(() => gameStore.chatMessages, (newMessages) => {
  const channelMessages = newMessages.filter(msg => msg.channel === props.channel);
  const newMessagesToAdd = channelMessages.filter(msg => 
    !messages.value.find(existing => existing.id === msg.id)
  );
  if(newMessagesToAdd.length) {
    messages.value.push(...newMessagesToAdd);
    scrollToBottom();
  }
}, { deep: true });

// Watcher pour s'abonner au channel chat quand le jeu est disponible
watch(() => gameStore.currentGame, (newGame) => {
  if (newGame && newGame.id) {
    gameStore.joinChatChannel(props.channel);
  }
}, { immediate: true });

onMounted(() => {
  loadMessages();
  // Joindre le channel chat si le jeu existe
  if (gameStore.currentGame) {
    gameStore.joinChatChannel(props.channel);
  }
});

// Nettoyer l'intervalle lors du démontage
onBeforeUnmount(() => {
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value);
  }
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-glass-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
  border-radius: 1rem;
  overflow: hidden;
}

.chat-header {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--color-glass-border);
  flex-shrink: 0;
}

.chat-title {
  font-family: var(--font-serif);
  font-size: 0.875rem;
  color: var(--color-cream);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.375rem 0.625rem;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.chat-footer {
  padding: 0.75rem;
  border-top: 1px solid var(--color-glass-border);
  flex-shrink: 0;
}

.quick-reactions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  justify-content: center;
}

.quick-reaction-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-glass-surface);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--color-glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-reaction-btn:hover:not(:disabled) {
  border-color: rgba(254, 243, 199, 0.5);
  transform: scale(1.1);
}

.quick-reaction-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  background: rgba(17, 24, 39, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 9999px;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.chat-input::placeholder {
  color: rgba(254, 243, 199, 0.4);
}

.chat-input:focus {
  outline: none;
  border-color: var(--color-soft-gold);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.send-button {
  padding: 0.5rem;
  border-radius: 50%;
  background: var(--color-soft-gold);
  color: var(--color-text-dark);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: var(--color-soft-gold-hover);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Firefox scrollbar */
.messages-area {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

/* Responsive */
@media (max-width: 640px) {
  .chat-container {
    border-radius: 0.75rem;
  }
  
  .chat-header {
    padding: 0.5rem;
  }
  
  .chat-title {
    font-size: 0.75rem;
  }
  
  .chat-footer {
    padding: 0.5rem;
  }
  
  .quick-reaction-btn {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
  
  .chat-input {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .send-button {
    padding: 0.375rem;
  }
  
  .send-icon {
    width: 1rem;
    height: 1rem;
  }
}

@media (max-width: 360px) {
  .chat-container {
    border-radius: 0.5rem;
  }
  
  .chat-header {
    padding: 0.375rem;
  }
  
  .chat-title {
    font-size: 0.625rem;
  }
  
  .chat-footer {
    padding: 0.375rem;
  }
  
  .quick-reactions {
    gap: 0.375rem;
    margin-bottom: 0.375rem;
  }
  
  .quick-reaction-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.875rem;
  }
  
  .input-area {
    gap: 0.375rem;
  }
  
  .chat-input {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .send-button {
    padding: 0.25rem;
  }
  
  .send-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .messages-area {
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 320px) {
  .input-area {
    flex-wrap: wrap;
  }
  
  .chat-input {
    width: 100%;
    margin-bottom: 0.25rem;
  }
  
  .send-button {
    width: 100%;
    border-radius: 0.5rem;
  }
  
  .quick-reactions {
    flex-wrap: wrap;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .quick-reaction-btn {
    transition: none;
  }
  
  .send-button {
    transition: none;
  }
}
</style>
