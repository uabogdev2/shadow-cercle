<template>
  <div class="day-start-container relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 animate-fade-in">
    <!-- Background - Aube (lumière chaude/dorée) -->
    <div class="absolute inset-0 z-0 bg-gradient-to-b from-soft-gold/30 via-cream/50 to-cream">
      <img 
        v-if="backgroundExists" 
        src="/images/backgrounds/village-dawn.webp" 
        alt="Village at dawn" 
        class="absolute inset-0 w-full h-full object-cover opacity-30 animate-fade-in"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-soft-gold/20 via-transparent to-cream/50"></div>
    </div>

    <!-- Sun Animation -->
    <div class="sun absolute top-10 z-10 animate-sun-rise"></div>

    <!-- Content -->
    <div class="relative z-20 text-center animate-fade-in-up">
      <h1 class="font-serif text-4xl font-bold text-text-dark text-shadow-md mb-8">
        Le Jour se Lève...
      </h1>
      
      <div v-if="loading" class="mt-8">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-text-dark/70 font-sans">Le village se réveille...</p>
      </div>
      
      <!-- Memorial Stele -->
      <div v-else-if="nightDeaths.length > 0" class="memorial-stele glass-surface border-glass-border rounded-xl shadow-lg p-6 max-w-md w-full mt-8 animate-scale-in">
        <h2 class="font-serif text-2xl text-text-dark/80 mb-4 text-shadow-sm">En mémoire de :</h2>
        <div class="space-y-3">
          <div 
            v-for="(death, index) in nightDeaths" 
            :key="death.id" 
            class="death-entry animate-fade-in-up"
            :style="{ animationDelay: `${index * 0.15}s` }"
          >
            <p class="text-xl font-bold text-blood-red font-serif">{{ death.user?.name }}</p>
            <p class="text-sm text-gray-600 font-sans">
              qui était <span class="font-semibold">{{ getRoleName(death.role) }}</span>
              <span v-if="death.reason" class="text-xs text-gray-500 ml-2">
                ({{ getDeathReason(death.reason) }})
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- No Deaths -->
      <div v-else class="mt-8 glass-surface border-green-500/30 rounded-xl p-6 max-w-md w-full animate-fade-in">
        <p class="text-green-800 font-sans text-xl font-semibold">
          Aucun mort cette nuit. Le village respire.
        </p>
      </div>

      <!-- Transition Message -->
      <p class="text-text-dark/50 font-sans text-sm italic mt-6 animate-fade-in-up" style="animation-delay: 1s">
        Le débat va bientôt commencer...
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const nightDeaths = ref([]);
const loading = ref(true);
const backgroundExists = ref(true);

function updateNightDeaths() {
  // CORRECTION: night_deaths est un tableau d'objets avec player_id, name, role, reason
  const deaths = gameStore.currentGame?.state?.night_deaths || [];
  if (deaths.length > 0) {
    // Mapper les morts depuis le state vers les joueurs
    nightDeaths.value = deaths.map(death => {
      const player = gameStore.players.find(p => p.id === death.player_id);
      return {
        id: death.player_id,
        user: player?.user || { name: death.name || 'Joueur inconnu' },
        role: death.role || player?.role || 'unknown',
        reason: death.reason || 'unknown'
      };
    });
  } else {
    nightDeaths.value = [];
  }
  loading.value = false;
}

const getRoleName = (role) => {
  const names = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    cupid: 'Cupidon',
    hunter: 'Chasseur',
    elder: 'Ancien',
    fool: 'Fou',
    villager: 'Villageois'
  };
  return names[role] || role;
};

const getDeathReason = (reason) => {
  const reasons = {
    wolf_attack: 'Attaqué par les loups',
    witch_kill: 'Potion de mort',
    hunter_shoot: 'Tir du Chasseur',
    lover_cascade: 'Mort de chagrin',
    vote_execution: 'Exécuté par vote'
  };
  return reasons[reason] || reason;
};

onMounted(() => {
  updateNightDeaths();
});

// Watcher pour mettre à jour si le state change
watch(() => gameStore.currentGame?.state?.night_deaths, () => {
  updateNightDeaths();
}, { deep: true });
</script>

<style scoped>
.day-start-container {
  background: linear-gradient(180deg, var(--color-cream) 0%, var(--color-soft-gold) 50%, var(--color-cream) 100%);
}

.sun {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle at 30% 30%, #FFE066, #FBBF24);
  border-radius: 50%;
  box-shadow: 
    0 0 60px rgba(251, 191, 36, 0.8),
    0 0 100px rgba(245, 158, 11, 0.6);
  left: 50%;
  transform: translateX(-50%);
}

.memorial-stele {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar personnalisée pour memorial-stele */
.memorial-stele::-webkit-scrollbar {
  width: 6px;
}

.memorial-stele::-webkit-scrollbar-track {
  background: transparent;
}

.memorial-stele::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}

.memorial-stele::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.memorial-stele {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.death-entry {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.death-entry:last-child {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .day-start-container {
    padding: 1rem;
  }
  
  .day-start-container :deep(h1) {
    font-size: 1.75rem;
  }
  
  .sun {
    width: 100px;
    height: 100px;
    top: 8%;
  }
  
  .memorial-stele {
    padding: 1rem;
    max-width: 100%;
    max-height: 50vh;
  }
  
  .memorial-stele :deep(h2) {
    font-size: 1.25rem;
  }
  
  .death-entry :deep(p) {
    font-size: 0.875rem;
  }
}

@media (max-width: 640px) {
  .day-start-container {
    padding: 0.875rem;
  }
  
  .day-start-container :deep(h1) {
    font-size: 1.5rem;
  }
  
  .sun {
    width: 90px;
    height: 90px;
    top: 6%;
  }
  
  .memorial-stele {
    padding: 0.875rem;
    max-height: 45vh;
  }
  
  .memorial-stele :deep(h2) {
    font-size: 1.125rem;
  }
  
  .death-entry :deep(p) {
    font-size: 0.8125rem;
  }
}

@media (min-width: 375px) and (max-width: 414px) {
  .day-start-container {
    padding: 0.875rem;
  }
  
  .day-start-container :deep(h1) {
    font-size: 1.625rem;
  }
  
  .sun {
    width: 95px;
    height: 95px;
  }
}

@media (max-width: 360px) {
  .day-start-container {
    padding: 0.75rem;
  }
  
  .day-start-container :deep(h1) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .sun {
    width: 80px;
    height: 80px;
    top: 5%;
  }
  
  .memorial-stele {
    padding: 0.75rem;
    max-height: 45vh;
    margin-top: 1rem;
  }
  
  .memorial-stele :deep(h2) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .death-entry {
    padding: 0.5rem 0;
  }
  
  .death-entry :deep(p) {
    font-size: 0.75rem;
  }
  
  .death-entry :deep(.text-xl) {
    font-size: 1rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .day-start-container :deep(h1) {
    font-size: 2rem;
  }
  
  .sun {
    width: 120px;
    height: 120px;
  }
  
  .memorial-stele {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .day-start-container :deep(h1) {
    font-size: 3rem;
  }
  
  .sun {
    width: 180px;
    height: 180px;
  }
}
</style>
