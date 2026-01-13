<template>
  <div v-if="isVisible" class="chat-container h-full flex flex-col rounded-xl overflow-hidden" :class="containerClass">
    <!-- Glass Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl"></div>
    
    <!-- Header -->
    <header class="relative z-10 px-4 py-3 border-b border-white/10 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <component :is="channelIcon" class="w-4 h-4" :class="channelIconColor" />
        <h3 class="text-sm font-medium text-slate-300 uppercase tracking-wider">{{ channelDisplayName }}</h3>
      </div>
      <div v-if="cooldownRemaining > 0" class="flex items-center gap-2 text-amber-500">
        <ClockIcon class="w-3 h-3" />
        <span class="text-xs font-medium">{{ cooldownRemaining }}s</span>
      </div>
    </header>

    <!-- Messages Area -->
    <div 
      class="relative z-10 flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin" 
      ref="messagesContainer"
    >
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-10">
        <MessageCircleIcon class="w-10 h-10 text-slate-700 mb-3" />
        <p class="text-slate-500 text-sm">Aucun message</p>
        <p class="text-slate-600 text-xs mt-1">Soyez le premier à écrire</p>
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
    <footer class="relative z-10 p-3 border-t border-white/10 bg-black/20">
      <!-- Quick Reactions -->
      <div v-if="showQuickReactions" class="flex gap-2 mb-3 justify-center overflow-x-auto pb-1">
        <button
          v-for="reaction in quickReactions"
          :key="reaction.emoji"
          @click="sendQuickReaction(reaction.emoji)"
          class="quick-reaction flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200"
          :class="{ 'opacity-50 cursor-not-allowed': cooldownRemaining > 0 }"
          :disabled="cooldownRemaining > 0"
          :title="reaction.label"
        >
          <span class="text-lg">{{ reaction.emoji }}</span>
        </button>
      </div>

      <!-- Input -->
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            :placeholder="cooldownRemaining > 0 ? 'Patientez...' : 'Votre message...'"
            :disabled="cooldownRemaining > 0"
            class="w-full bg-slate-800/50 text-slate-200 placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-700/50 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200"
          />
        </div>
        <button 
          @click="sendMessage" 
          :disabled="!newMessage.trim() || cooldownRemaining > 0 || isSending" 
          class="send-button px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <SendIcon class="w-5 h-5" />
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
import { Send as SendIcon, MessageCircle as MessageCircleIcon, Clock as ClockIcon, Users as UsersIcon, Moon as MoonIcon, Skull as SkullIcon, MessageSquare as MessageSquareIcon } from 'lucide-vue-next';
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

const channelDisplayName = computed(() => {
  const names = {
    lobby: 'Salon',
    global: 'Village',
    wolves: 'Meute',
    dead: 'Cimetière',
  };
  return names[props.channel] || 'Chat';
});

const channelIcon = computed(() => {
  const icons = {
    lobby: UsersIcon,
    global: MessageSquareIcon,
    wolves: MoonIcon,
    dead: SkullIcon,
  };
  return icons[props.channel] || MessageSquareIcon;
});

const channelIconColor = computed(() => {
  const colors = {
    lobby: 'text-amber-400',
    global: 'text-sky-400',
    wolves: 'text-red-400',
    dead: 'text-slate-500',
  };
  return colors[props.channel] || 'text-slate-400';
});

const containerClass = computed(() => {
  const classes = {
    lobby: 'border border-amber-500/20',
    global: 'border border-sky-500/20',
    wolves: 'border border-red-500/30',
    dead: 'border border-slate-600/30',
  };
  return classes[props.channel] || '';
});

const quickReactions = [
  { emoji: '🤔', label: 'Réflexion' },
  { emoji: '🐺', label: 'Loup' },
  { emoji: '🛡️', label: 'Protection' },
  { emoji: '☝️', label: 'Attention' },
  { emoji: '👀', label: 'Observation' },
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
        window.showNotification(error.response?.data?.message || 'Veuillez patienter', 'warning');
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
.chat-container {
  position: relative;
}

.quick-reaction:hover:not(:disabled) {
  transform: scale(1.1);
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
