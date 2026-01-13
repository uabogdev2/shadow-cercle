<!-- NightStart.vue -->
<template>
  <div class="night-start h-screen w-screen flex items-center justify-center flex-col relative overflow-hidden">
    <!-- Night Background with stars -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <!-- Stars -->
      <div class="absolute inset-0" style="background-image: radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 160px 30px, rgba(255,255,255,0.5), transparent); background-size: 200px 100px;"></div>
      <!-- Ambient glow -->
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Moon rising -->
    <div class="absolute top-20 right-20 w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_60px_rgba(248,250,252,0.4)] opacity-80 animate-float"></div>

    <!-- Content -->
    <div class="relative z-10 text-center">
      <MoonIcon class="w-16 h-16 text-violet-400/60 mx-auto mb-6" />
      
      <h1 class="text-cinzel text-4xl md:text-5xl text-violet-300 mb-4">La Nuit Tombe</h1>
      <div class="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-violet-500/50 to-transparent mb-4"></div>
      <p class="text-slate-500 uppercase tracking-widest text-sm">Le village s'endort...</p>
    </div>
  </div>
</template>

<script setup>
import { Moon as MoonIcon } from 'lucide-vue-next';
</script>

<style scoped>
.night-start {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
