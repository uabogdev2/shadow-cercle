<template>
  <div v-if="isVisible" class="h-full flex flex-col border-2 border-white bg-black">
    <!-- Header -->
    <header class="p-2 border-b-2 border-white bg-black flex justify-between items-center">
      <h3 class="text-mono text-xs uppercase tracking-widest text-gray-400">CHANNEL: {{ channelName.toUpperCase() }}</h3>
      <div v-if="cooldownRemaining > 0" class="text-red-600 text-xs font-bold animate-pulse">COOLDOWN: {{ cooldownRemaining }}s</div>
    </header>

    <!-- Messages Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm bg-black" ref="messagesContainer">
      <div v-if="messages.length === 0" class="text-center text-gray-700 py-10">
        NO DATA TRANSMITTED
      </div>
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
    <footer class="p-2 border-t-2 border-white bg-black">
      <!-- Quick Reactions -->
      <div v-if="showQuickReactions" class="flex gap-2 mb-2 justify-center overflow-x-auto pb-2">
        <button
          v-for="reaction in quickReactions"
          :key="reaction.emoji"
          @click="sendQuickReaction(reaction.emoji)"
          class="border border-gray-600 hover:border-white hover:bg-white hover:text-black p-2 min-w-[40px] text-center transition-colors"
          :disabled="cooldownRemaining > 0"
        >
          {{ reaction.emoji }}
        </button>
      </div>

      <!-- Input -->
      <div class="flex gap-0 border-2 border-white">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          :placeholder="cooldownRemaining > 0 ? 'WAITING...' : 'ENTER COMMAND...'"
          :disabled="cooldownRemaining > 0"
          class="flex-1 bg-black text-white p-2 font-mono outline-none placeholder-gray-700"
        />
        <button 
          @click="sendMessage" 
          :disabled="!newMessage.trim() || cooldownRemaining > 0 || isSending" 
          class="px-4 bg-white text-black hover:bg-red-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-600 transition-colors uppercase font-bold"
        >
          SEND
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
    lobby: 'LOBBY',
    global: 'VILLAGE',
    wolves: 'WOLVES',
    dead: 'GRAVEYARD',
  };
  return names[props.channel] || 'UNKNOWN';
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
    messages.value = loadedMessages.map(msg => ({
      ...msg,
      channel: props.channel
    }));
    scrollToBottom();
  } catch (error) {
    console.error('Error loading messages:', error);
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
    startCooldown(5);
  } catch (error) {
    console.error('Error sending message:', error);
    if (error.response?.status === 429) {
      const cooldown = error.response?.data?.cooldown_remaining || 5;
      startCooldown(cooldown);
      if (window.showNotification) {
        window.showNotification(error.response?.data?.message || 'Veuillez attendre', 'warning');
      }
    }
  } finally {
    isSending.value = false;
  }
}

function startCooldown(seconds) {
  cooldownRemaining.value = seconds;
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
    startCooldown(5);
  } catch (error) {
    console.error('Error sending quick reaction:', error);
    if (error.response?.status === 429) {
      const cooldown = error.response?.data?.cooldown_remaining || 5;
      startCooldown(cooldown);
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

watch(() => gameStore.currentGame, (newGame) => {
  if (newGame && newGame.id) {
    gameStore.joinChatChannel(props.channel);
  }
}, { immediate: true });

onMounted(() => {
  loadMessages();
  if (gameStore.currentGame) {
    gameStore.joinChatChannel(props.channel);
  }
});

onBeforeUnmount(() => {
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value);
  }
});
</script>

<style scoped>
/* No scoped styles needed, using utility classes */
</style>
