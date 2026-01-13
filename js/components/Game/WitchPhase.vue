<!-- WitchPhase.vue -->
<template>
  <div class="witch-phase h-screen w-screen flex flex-col relative overflow-hidden">
    <!-- Mystical Background -->
    <div class="absolute inset-0 phase-night">
      <div class="noise-overlay"></div>
      <div class="absolute top-20 left-10 w-32 h-32 bg-emerald-500/16 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-40 right-10 w-48 h-48 bg-pink-500/14 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Moon -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_40px_rgba(248,250,252,0.3)] opacity-60 z-20"></div>

    <!-- Header -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex justify-between items-center border-pink-500/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
            <FlaskConicalIcon class="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <p class="text-slate-500 text-xs uppercase tracking-wider">Phase de Nuit</p>
            <p class="text-pink-400 text-lg font-medium">La Sorcière</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <template v-if="gameStore.canAct">
        <!-- Target Status -->
        <div class="glass-card p-4 mb-6 text-center" :class="wolvesTarget ? 'border-red-500/30' : 'border-emerald-500/30'">
          <p class="text-slate-500 text-xs uppercase tracking-wider mb-2">Victime des loups</p>
          <div v-if="wolvesTarget">
            <p class="text-2xl text-white font-medium mb-1">{{ wolvesTarget.user?.name }}</p>
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
              <HeartCrackIcon class="w-4 h-4" />
              En danger de mort
            </span>
          </div>
          <div v-else>
            <p class="text-emerald-400 font-medium">Personne n'a été attaqué</p>
          </div>
        </div>

        <!-- Potions -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- Heal Potion -->
          <div 
            class="potion-card p-4 rounded-xl text-center transition-all"
            :class="hasHealPotion ? 'bg-emerald-500/10 border border-emerald-500/30 cursor-pointer hover:border-emerald-400' : 'bg-slate-800/30 border border-slate-700 opacity-50'"
          >
            <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mx-auto mb-3 flex items-center justify-center">
              <span class="text-3xl">💚</span>
            </div>
            <p class="text-emerald-400 font-medium mb-1">Potion de Vie</p>
            <p class="text-slate-500 text-xs">{{ hasHealPotion ? 'Disponible' : 'Utilisée' }}</p>
          </div>

          <!-- Kill Potion -->
          <div 
            class="potion-card p-4 rounded-xl text-center transition-all"
            :class="hasKillPotion ? 'bg-pink-500/10 border border-pink-500/30 cursor-pointer hover:border-pink-400' : 'bg-slate-800/30 border border-slate-700 opacity-50'"
          >
            <div class="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/30 mx-auto mb-3 flex items-center justify-center">
              <span class="text-3xl">💀</span>
            </div>
            <p class="text-pink-400 font-medium mb-1">Potion de Mort</p>
            <p class="text-slate-500 text-xs">{{ hasKillPotion ? 'Disponible' : 'Utilisée' }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <ActionButton 
            v-if="hasHealPotion && wolvesTarget" 
            variant="emerald" 
            :full-width="true" 
            :glow="true"
            @click="useHealPotion"
          >
            <span class="flex items-center justify-center gap-2">
              <HeartIcon class="w-5 h-5" />
              Sauver {{ wolvesTarget.user?.name }}
            </span>
          </ActionButton>

          <div v-if="hasKillPotion">
            <p class="text-slate-400 text-sm text-center mb-3">Empoisonner quelqu'un :</p>
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div 
                v-for="player in availableKillTargets" 
                :key="player.id"
                class="p-2 rounded-lg text-center cursor-pointer transition-all"
                :class="selectedKillTarget?.id === player.id 
                  ? 'bg-pink-500/20 border-2 border-pink-500' 
                  : 'bg-slate-800/50 border border-slate-700 hover:border-pink-500/50'"
                @click="selectKillTarget(player)"
              >
                <div class="w-10 h-10 rounded-full bg-slate-700 mx-auto mb-1 flex items-center justify-center text-sm font-medium text-white">
                  {{ player.user?.name?.[0]?.toUpperCase() }}
                </div>
                <p class="text-xs text-slate-300 truncate">{{ player.user?.name }}</p>
              </div>
            </div>
            <ActionButton 
              v-if="selectedKillTarget" 
              variant="danger" 
              :full-width="true"
              @click="useKillPotion"
            >
              Empoisonner {{ selectedKillTarget.user?.name }}
            </ActionButton>
          </div>
        </div>

        <!-- Skip -->
        <div class="mt-8">
          <ActionButton variant="secondary" :full-width="true" @click="skipAction">
            Ne rien faire
          </ActionButton>
        </div>
      </template>

      <div v-else class="h-full flex items-center justify-center">
        <div class="glass-card p-8 text-center">
          <FlaskConicalIcon class="w-12 h-12 text-pink-400/50 mx-auto mb-4" />
          <p class="text-slate-400">En attente de la sorcière...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { FlaskConical as FlaskConicalIcon, Heart as HeartIcon, HeartCrack as HeartCrackIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedKillTarget = ref(null);

const wolvesTarget = computed(() => {
  const targetId = gameStore.currentGame?.state?.wolves_target_id;
  if (targetId) return gameStore.players.find(p => p.id === targetId);
  return null;
});

const witchPlayer = computed(() => gameStore.currentPlayer);
const hasHealPotion = computed(() => witchPlayer.value?.metadata?.heal_potion !== false);
const hasKillPotion = computed(() => witchPlayer.value?.metadata?.kill_potion !== false);
const availableKillTargets = computed(() => gameStore.livingPlayers.filter(p => p.id !== witchPlayer.value?.id));

function selectKillTarget(player) { 
  if (player.id !== witchPlayer.value?.id) selectedKillTarget.value = player; 
}

async function useHealPotion() {
  if (!wolvesTarget.value) return;
  await gameStore.submitAction('witch_potion', wolvesTarget.value.id, { potion_type: 'heal' });
}

async function useKillPotion() {
  if (!selectedKillTarget.value) return;
  await gameStore.submitAction('witch_potion', selectedKillTarget.value.id, { potion_type: 'kill' });
  selectedKillTarget.value = null;
}

async function skipAction() {
  await gameStore.submitAction('witch_potion', null, { potion_type: 'skip' });
}
</script>

<style scoped>
.witch-phase {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}
</style>
