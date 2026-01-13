<!-- NightProcessing.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
    <!-- Processing animation -->
    <div class="text-center max-w-md">
      <div class="mb-8">
        <div class="w-16 h-16 border-2 border-white mx-auto mb-4 relative">
          <div class="absolute inset-0 border-2 border-white animate-ping"></div>
        </div>
        <h2 class="text-display text-3xl text-white mb-2">PROCESSING</h2>
        <div class="h-1 bg-white w-24 mx-auto"></div>
      </div>

      <p class="text-mono text-sm text-gray-500 uppercase animate-pulse">
        Analyzing night operations...
      </p>

      <!-- Progress dots -->
      <div class="flex justify-center gap-2 mt-8">
        <div class="w-2 h-2 bg-white animate-bounce" style="animation-delay: 0ms;"></div>
        <div class="w-2 h-2 bg-white animate-bounce" style="animation-delay: 150ms;"></div>
        <div class="w-2 h-2 bg-white animate-bounce" style="animation-delay: 300ms;"></div>
      </div>
    </div>

    <!-- Scanlines effect -->
    <div class="absolute inset-0 pointer-events-none opacity-5" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px);"></div>
  </div>
</template>

<script setup>
// This is a transition screen that shows during night_processing phase
// No logic needed, the backend handles the phase transition
</script>
