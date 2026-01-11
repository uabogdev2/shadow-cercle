<!-- js/components/Game/RoleReveal.vue -->
<template>
  <div class="h-screen w-full flex flex-col items-center justify-center bg-black p-4">
    <div class="w-full max-w-sm h-[500px] perspective-1000">
      <div
        class="relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer"
        :class="{ 'rotate-y-180': isFlipped }"
        @click="flipCard"
      >
        <!-- Front (Back of card actually) -->
        <div class="absolute inset-0 backface-hidden bg-black border-4 border-white flex flex-col items-center justify-center p-8">
          <div class="border-2 border-white p-4 mb-4">
            <h2 class="text-display text-3xl text-white tracking-widest uppercase">CLASSIFIED</h2>
          </div>
          <p class="text-mono text-sm text-gray-400 uppercase mb-8">TOP SECRET // EYES ONLY</p>
          <div class="animate-pulse text-red-600 font-mono text-xs border border-red-600 px-2 py-1">
            TAP TO DECRYPT
          </div>
        </div>

        <!-- Back (Revealed Role) -->
        <div class="absolute inset-0 backface-hidden rotate-y-180 bg-white text-black border-4 border-white flex flex-col p-6 overflow-y-auto">
          <div class="border-b-4 border-black pb-4 mb-4 text-center">
            <h2 class="text-display text-4xl uppercase leading-none break-words" :style="{ color: roleColor }">
              {{ roleData.name }}
            </h2>
          </div>

          <div class="flex-1 flex flex-col items-center mb-4">
            <div class="w-32 h-32 border-4 border-black mb-4 bg-gray-200 flex items-center justify-center overflow-hidden">
               <!-- Simple image or icon placeholder -->
               <span class="text-6xl">{{ roleIcon }}</span>
            </div>
            <p class="text-mono text-sm leading-relaxed text-justify border-l-4 border-black pl-4">
              {{ roleData.description }}
            </p>
          </div>

          <div class="mt-auto">
            <ActionButton
              v-if="!confirmed && gameStore.phase === 'role_reveal'"
              variant="primary"
              :full-width="true"
              :loading="isConfirming"
              @click.stop="confirmRole"
              class="bg-black text-white hover:bg-gray-800"
            >
              ACKNOWLEDGE
            </ActionButton>
            <div v-else class="text-center font-mono text-xs uppercase animate-pulse">
              AWAITING SQUAD SYNCHRONIZATION...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import ActionButton from '@/components/UI/ActionButton.vue';

const gameStore = useGameStore();
const isFlipped = ref(false);
const confirmed = ref(false);
const isConfirming = ref(false);
const result = ref(null);

const roleData = computed(() => {
  const role = gameStore.currentPlayer?.role || 'villager';
  const roles = {
    werewolf: { name: 'Werewolf', description: 'Eliminate all civilians. Work with your pack at night.', color: '#ef4444' },
    seer: { name: 'Seer', description: 'Gather intel. Reveal one identity each night.', color: '#a855f7' },
    witch: { name: 'Witch', description: 'Life and Death authority. One heal, one kill.', color: '#ec4899' },
    guard: { name: 'Bodyguard', description: 'Protect a target each night.', color: '#3b82f6' },
    hunter: { name: 'Hunter', description: 'If you die, take someone with you.', color: '#f59e0b' },
    cupid: { name: 'Cupid', description: 'Link two fates together.', color: '#f43f5e' },
    elder: { name: 'Elder', description: 'Tough to kill. Survives one wolf attack.', color: '#6b7280' },
    fool: { name: 'Fool', description: 'You think you have intel, but you don\'t.', color: '#8b5cf6' },
    villager: { name: 'Civilian', description: 'Identify and eliminate the threats via voting.', color: '#10b981' },
  };
  return roles[role] || roles['villager'];
});

const roleIcon = computed(() => {
    const icons = { werewolf: '🐺', seer: '🔮', witch: '🧪', guard: '🛡️', hunter: '🔫', cupid: '💘', elder: '👴', fool: '🃏', villager: '🧑' };
    return icons[gameStore.currentPlayer?.role] || '❓';
});

const roleColor = computed(() => roleData.value.color);

const flipCard = () => {
  if (!isFlipped.value) isFlipped.value = true;
};

async function confirmRole() {
  if (confirmed.value || isConfirming.value) return;
  if (gameStore.currentPlayer?.metadata?.role_revealed) {
    confirmed.value = true;
    return;
  }
  
  try {
    isConfirming.value = true;
    confirmed.value = true;
    result.value = await gameStore.confirmRoleReveal();
    confirmed.value = true;
  } catch (error) {
    if (!error.response?.data?.already_confirmed) confirmed.value = false;
  } finally {
    isConfirming.value = false;
  }
}

// ... Keep existing logic for watchers ...
const hasCheckedInitialConfirmation = ref(false);
watch(() => gameStore.currentPlayer, (player) => {
  if (!hasCheckedInitialConfirmation.value && player?.metadata?.role_revealed) {
    confirmed.value = true;
    hasCheckedInitialConfirmation.value = true;
  }
}, { immediate: true });

let hasLeftRoleReveal = false;
watch(() => gameStore.phase, (newPhase) => {
  if (newPhase !== 'role_reveal') {
    hasLeftRoleReveal = true;
    confirmed.value = true;
  }
}, { immediate: true });

onMounted(() => {
  if (hasLeftRoleReveal) return;
  if (gameStore.currentPlayer?.metadata?.role_revealed && !hasCheckedInitialConfirmation.value) {
    confirmed.value = true;
    hasCheckedInitialConfirmation.value = true;
  }
});
</script>

<style scoped>
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
</style>
