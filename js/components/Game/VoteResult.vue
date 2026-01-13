<!-- js/components/Game/VoteResult.vue -->
<template>
  <div class="vote-result h-screen w-screen flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/50 to-slate-950">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <div class="glass-card p-6">
        <h1 class="text-cinzel text-2xl text-amber-400 mb-6 text-center">Résultats du Vote</h1>
        
        <!-- Vote counts -->
        <div v-if="Object.keys(voteCounts).length > 0" class="space-y-3 mb-8">
          <div
            v-for="(count, name) in sortedVoteCounts"
            :key="name"
            class="flex items-center justify-between p-3 rounded-xl transition-all"
            :class="name === designatedPlayer?.user?.name 
              ? 'bg-red-500/20 border border-red-500/40' 
              : 'bg-slate-800/30 border border-slate-700/30'"
          >
            <span class="text-white font-medium">{{ name }}</span>
            <div class="flex items-center gap-3">
              <div class="flex gap-1">
                <div 
                  v-for="i in count" 
                  :key="i"
                  class="w-2 h-6 rounded-full"
                  :class="name === designatedPlayer?.user?.name ? 'bg-red-500' : 'bg-violet-500'"
                ></div>
              </div>
              <span 
                class="font-bold text-lg min-w-[24px] text-center"
                :class="name === designatedPlayer?.user?.name ? 'text-red-400' : 'text-violet-400'"
              >
                {{ count }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Designated player -->
        <div v-if="designatedPlayer" class="text-center">
          <div class="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>
          
          <p class="text-slate-400 text-sm uppercase tracking-wider mb-3">Condamné</p>
          
          <div class="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/40">
            <span class="text-white text-xl font-medium">{{ designatedPlayer.user?.name }}</span>
          </div>
          
          <div class="mt-4">
            <span 
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              :style="{ 
                backgroundColor: `${getRoleColor(voteResult?.target_role)}20`,
                borderColor: `${getRoleColor(voteResult?.target_role)}40`,
                color: getRoleColor(voteResult?.target_role)
              }"
              style="border: 1px solid;"
            >
              {{ getRoleIcon(voteResult?.target_role) }}
              {{ getRoleName(voteResult?.target_role) }}
            </span>
          </div>
        </div>
        
        <!-- No consensus -->
        <div v-else class="text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">⚖️</span>
          </div>
          <p class="text-emerald-400 text-xl font-medium mb-2">Pas de consensus</p>
          <p class="text-slate-400 text-sm">Personne n'est éliminé</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import axios from 'axios';

const gameStore = useGameStore();
const voteCounts = ref({});

const voteResult = computed(() => gameStore.currentGame?.state?.vote_result || null);

const designatedPlayer = computed(() => {
  const targetId = voteResult.value?.target_id;
  if (!targetId) return null;
  return gameStore.players.find(p => p.id === targetId);
});

const sortedVoteCounts = computed(() => {
  const entries = Object.entries(voteCounts.value);
  entries.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries);
});

function getRoleName(role) {
  const names = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    hunter: 'Chasseur',
    cupid: 'Cupidon',
    elder: 'Ancien',
    fool: 'Idiot',
    villager: 'Villageois'
  };
  return names[role] || role || 'Inconnu';
}

function getRoleIcon(role) {
  const icons = {
    werewolf: '🐺',
    seer: '🔮',
    witch: '🧪',
    guard: '🛡️',
    hunter: '🏹',
    cupid: '💘',
    elder: '👴',
    fool: '🃏',
    villager: '🏠'
  };
  return icons[role] || '❓';
}

function getRoleColor(role) {
  const colors = {
    werewolf: '#EF4444',
    seer: '#7C3AED',
    witch: '#EC4899',
    guard: '#3B82F6',
    hunter: '#F59E0B',
    cupid: '#F43F5E',
    elder: '#6B7280',
    fool: '#8B5CF6',
    villager: '#10B981'
  };
  return colors[role] || '#94A3B8';
}

async function fetchVoteDetails() {
  if (!gameStore.currentGame) return;
  try {
    const response = await axios.get(`/games/${gameStore.currentGame.id}/actions`);
    if (response.data.success && response.data.actions) {
      const votes = response.data.actions.filter(a => 
        a.type === 'day_vote' && a.round === gameStore.currentGame?.day_number
      );
      const counts = {};
      votes.forEach(vote => {
        if (vote.target_id) {
          const target = gameStore.players.find(p => p.id === vote.target_id);
          if (target) {
            const name = target.user?.name || 'Inconnu';
            counts[name] = (counts[name] || 0) + 1;
          }
        }
      });
      voteCounts.value = counts;
    }
  } catch (error) { 
    console.error(error); 
  }
}

onMounted(() => fetchVoteDetails());
</script>

<style scoped>
.vote-result {
  min-height: 100vh;
  min-height: 100dvh;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
</style>
