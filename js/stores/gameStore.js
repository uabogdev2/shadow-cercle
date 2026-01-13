import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
import { useAuthStore } from './authStore';

window.Pusher = Pusher;

export const useGameStore = defineStore('game', () => {
  // State
  const currentGame = ref(null);
  const currentPlayer = ref(null);
  const players = ref([]);
  const phase = ref('lobby');
  const timer = ref(0);
  const myRole = ref(null);
  const isAlive = ref(true);
  const chatMessages = ref([]);
  const gameState = ref({});
  
  // CORRECTION: Flag pour suivre si on a quitté role_reveal (pour éviter les retours)
  const hasLeftRoleReveal = ref(false);
  
  // WebSocket Echo
  let echo = null;
  let subscribedChannels = new Set(); // Pour éviter les souscriptions multiples
  
  function initializeEcho() {
    if (!echo && import.meta.env.VITE_REVERB_APP_KEY) {
      try {
        echo = new Echo({
          broadcaster: 'reverb',
          key: import.meta.env.VITE_REVERB_APP_KEY,
          wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
          wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
          wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
          forceTLS: false,
          enabledTransports: ['ws', 'wss'],
          authEndpoint: '/api/broadcasting/auth',
          authorizer: (channel, options) => {
            return {
              authorize: (socketId, callback) => {
                const token = localStorage.getItem('token');
                console.log('🔐 [WebSocket] Authorizing channel:', channel.name, 'socketId:', socketId);
                // Utiliser /broadcasting/auth avec le baseURL par défaut /api pour utiliser la route authentifiée
                axios.post('/broadcasting/auth', {
                  socket_id: socketId,
                  channel_name: channel.name
                }, {
                  headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  }
                  // Pas besoin d'override baseURL, axios utilise déjà baseURL: '/api' par défaut
                })
                .then(response => {
                  console.log('✅ [WebSocket] Channel authorized:', channel.name);
                  callback(false, response.data);
                })
                .catch(error => {
                  console.error('❌ [WebSocket] Broadcasting auth error:', error);
                  console.error('❌ [WebSocket] Auth error details:', error.response?.data);
                  callback(true, error);
                });
              }
            };
          },
        });
        
        // Log de connexion
        echo.connector.pusher.connection.bind('connected', () => {
          console.log('✅ [WebSocket] Connected to Reverb server');
        });
        
        echo.connector.pusher.connection.bind('disconnected', () => {
          console.log('⚠️ [WebSocket] Disconnected from Reverb server');
        });
        
        echo.connector.pusher.connection.bind('error', (error) => {
          console.error('❌ [WebSocket] Connection error:', error);
        });
      } catch (error) {
        console.warn('Laravel Echo initialization error (Reverb may not be configured):', error);
      }
    }
    return echo;
  }
  
  // Computed
  const isHost = computed(() => {
    if (!currentGame.value || !currentPlayer.value) return false;
    return currentGame.value.config?.host_id === currentPlayer.value.user_id;
  });
  
  const livingPlayers = computed(() => {
    return players.value.filter(p => p.is_alive);
  });
  
  const deadPlayers = computed(() => {
    return players.value.filter(p => !p.is_alive);
  });
  
  const canAct = computed(() => {
    if (!currentPlayer.value) return false;
    
    // FLOW CANON: Special case for hunter - can act even if dead
    const hunterPhases = ['hunter_action', 'hunter_day_action'];
    if (hunterPhases.includes(phase.value) && currentPlayer.value.role === 'hunter') {
      return true; // Hunter can shoot even if dead (that's the whole point)
    }
    
    if (!currentPlayer.value.is_alive) return false;
    
    // FLOW CANON: Vérifier la phase et le rôle
    const roleActions = {
      'night_wolves': ['werewolf'],
      'night_seer': ['seer'],
      'night_witch': ['witch'],
      'night_guard': ['guard'],
      'night_cupid': ['cupid'],
      'day_vote': ['all']
    };
    
    const allowedRoles = roleActions[phase.value] || [];
    return allowedRoles.includes('all') || 
           allowedRoles.includes(currentPlayer.value.role);
  });
  
  // Actions
  async function createGame(playerCount) {
    try {
      const response = await axios.post('/games', {
        player_count: playerCount
      });
      
      const data = response.data;
      if (data.success && data.game) {
        currentGame.value = data.game;
        updatePlayers(data.game.players || []);
        joinGameChannel(data.game.id);
        return data.code;
      }
    } catch (error) {
      console.error('Error creating game:', error);
      if (window.showNotification) {
        window.showNotification('Erreur lors de la création de la partie', 'error');
      }
    }
  }
  
  async function joinGame(code) {
    try {
      const response = await axios.post(`/games/${code}/join`);
      
      const data = response.data;
      if (data.success && data.game) {
        currentGame.value = data.game;
        updatePlayers(data.game.players || []);
        joinGameChannel(data.game.id);
      }
      return data;
    } catch (error) {
      console.error('Error joining game:', error);
      if (window.showNotification) {
        window.showNotification('Erreur lors de la connexion à la partie', 'error');
      }
    }
  }
  
  async function startGame() {
    if (!currentGame.value) return;
    
    try {
      const response = await axios.post(`/games/${currentGame.value.id}/start`);
      
      const data = response.data;
      if (data.success && data.game) {
        // Mettre à jour le jeu depuis la réponse
        currentGame.value = data.game;
        updatePlayers(data.game.players || []);
        // CORRECTION: Ne pas revenir à role_reveal une fois qu'on l'a quitté
        const newPhase = data.game.phase || phase.value;
        if (newPhase === 'role_reveal' && hasLeftRoleReveal.value) {
          console.warn('⚠️ [GameStore] Ignoring role_reveal phase in startGame (hasLeftRoleReveal = true)');
        } else {
          phase.value = newPhase;
          if (newPhase !== 'role_reveal' && newPhase !== 'lobby') {
            hasLeftRoleReveal.value = true;
          }
        }
      }
      return data.success;
    } catch (error) {
      console.error('Error starting game:', error);
      if (window.showNotification) {
        window.showNotification('Erreur lors du démarrage de la partie', 'error');
      }
    }
  }
  
  async function submitAction(type, targetId = null, data = {}) {
    if (!currentGame.value) return;
    
    try {
      const response = await axios.post(`/games/${currentGame.value.id}/actions`, {
        type,
        target_id: targetId,
        data
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting action:', error);
      if (window.showNotification) {
        window.showNotification('Erreur lors de l\'envoi de l\'action', 'error');
      }
    }
  }
  
  async function toggleReady() {
    if (!currentGame.value) return;
    
    try {
      const response = await axios.post(`/games/${currentGame.value.id}/ready`);
      const data = response.data;
      
      if (data.success) {
        // Mettre à jour immédiatement depuis la réponse
        if (data.game) {
          currentGame.value = data.game;
          updatePlayers(data.game.players || []);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  }
  
  async function confirmRoleReveal() {
    if (!currentGame.value) return;
    
    try {
      const response = await axios.post(`/games/${currentGame.value.id}/confirm-role-reveal`);
      const data = response.data;
      
      if (data.success) {
        // Mettre à jour le jeu depuis la réponse
        if (data.game) {
          currentGame.value = data.game;
          updatePlayers(data.game.players || []);
          
          // CORRECTION CRITIQUE: Si tous ont confirmé, le backend va appeler startFirstNight
          // qui va émettre PhaseChanged. NE PAS mettre à jour la phase manuellement ici.
          // Laisser l'événement PhaseChanged gérer la transition pour éviter les conflits.
          if (data.all_confirmed) {
            console.log('🎭 [GameStore] All players confirmed, waiting for PhaseChanged event from WebSocket...');
            // Ne PAS mettre à jour phase.value ici - attendre PhaseChanged
            // Ne PAS définir hasLeftRoleReveal ici non plus - PhaseChanged le fera
            return data;
          }
          
          // Si tous n'ont pas encore confirmé, mettre à jour la phase seulement si c'est toujours role_reveal
          // (pour refléter le statut de confirmation des autres joueurs)
          const newPhase = data.game.phase || phase.value;
          if (newPhase === 'role_reveal') {
            // Rester en role_reveal jusqu'à ce que tous confirment
            phase.value = newPhase;
          } else if (newPhase === 'role_reveal' && hasLeftRoleReveal.value) {
            console.warn('⚠️ [GameStore] Ignoring role_reveal phase in confirmRoleReveal (hasLeftRoleReveal = true)');
          }
        }
        
        return data;
      }
      
      return data;
    } catch (error) {
      console.error('Error confirming role:', error);
      throw error;
    }
  }
  
  async function leaveGame() {
    if (!currentGame.value) return;
    
    try {
      const gameId = currentGame.value.id;
      const response = await axios.post(`/games/${gameId}/leave`);
      const data = response.data;
      
      if (data.success) {
        // Réinitialiser l'état du jeu
        resetGame();
      }
      
      return data;
    } catch (error) {
      console.error('Error leaving game:', error);
      // Même en cas d'erreur, réinitialiser l'état local
      resetGame();
      throw error;
    }
  }
  
  function joinGameChannel(gameId) {
    const channelName = `game.${gameId}.state`;
    
    // Éviter les souscriptions multiples
    if (subscribedChannels.has(channelName)) {
      console.log('ℹ️ [WebSocket] Already subscribed to channel:', channelName, ', skipping');
      return;
    }
    
    console.log('🔌 [WebSocket] Joining game channel:', gameId);
    const echoInstance = initializeEcho();
    
    if (!echoInstance) {
      console.error('❌ [WebSocket] Reverb not available. Please ensure Reverb server is running.');
      return;
    }
    
    console.log('✅ [WebSocket] Reverb available, setting up listeners');
    console.log('📡 [WebSocket] Subscribing to private channel:', channelName);
    
    // Marquer comme souscrit
    subscribedChannels.add(channelName);
    
    // Écouter les mises à jour du jeu (channel privé nécessitant autorisation)
    const stateChannel = echoInstance.private(channelName);
    
    // Log de souscription réussie
    stateChannel.subscribed(() => {
      console.log('✅ [WebSocket] Successfully subscribed to channel:', channelName);
    });
    
    stateChannel.error((error) => {
      console.error('❌ [WebSocket] Error subscribing to channel:', channelName, error);
    });
    
    stateChannel
        .listen('.GameUpdated', (e) => {
          console.log('📢 [WebSocket] GameUpdated event received');
          console.log('📢 [WebSocket] GameUpdated event data:', JSON.stringify(e, null, 2));
          if (e.game) {
            const oldPhase = phase.value;
            const oldStatus = currentGame.value?.status;
            
            // CORRECTION CRITIQUE: GameUpdated ne doit JAMAIS changer la phase
            // Seul PhaseChanged peut changer la phase
            // GameUpdated met seulement à jour les autres données (joueurs, state, status, etc.)
            
            // Mettre à jour le jeu complet, mais TOUJOURS préserver la phase actuelle
            const updatedGame = { ...currentGame.value, ...e.game };
            // FORCER la phase actuelle - phase.value est la source de vérité
            updatedGame.phase = phase.value;
            
            // CORRECTION: S'assurer que le state est bien mis à jour (important pour vote_result, wolves_target_id, etc.)
            if (e.game.state) {
              updatedGame.state = { ...(currentGame.value?.state || {}), ...e.game.state };
            }
            
            // Mettre à jour le status si nécessaire (mais pas la phase)
            if (e.game.status && e.game.status !== currentGame.value?.status) {
              updatedGame.status = e.game.status;
            }
            
            currentGame.value = updatedGame;
            updatePlayers(e.game.players || []);
            
            console.log('✅ [WebSocket] Game updated (phase preserved). Phase:', phase.value, 'Status:', oldStatus, '->', updatedGame.status);
            
            // Si le joueur actuel n'est plus dans la partie, réinitialiser
            const userPlayer = (e.game.players || []).find(p => 
              p.user_id === currentPlayer.value?.user_id
            );
            if (!userPlayer && currentPlayer.value) {
              console.log('Player no longer in game, resetting...');
              resetGame();
            }
          }
        })
        .listen('GameDeleted', (e) => {
          console.log('🗑️ GameDeleted event received:', e);
          // Réinitialiser l'état
          resetGame();
          // Rediriger vers l'accueil si on est dans le lobby ou le jeu
          if (window.location.pathname.includes('/lobby/') || window.location.pathname.includes('/game/')) {
            window.location.href = '/';
          }
        })
      .listen('.PhaseChanged', (e) => {
        console.log('🔄 [WebSocket] PhaseChanged event received:', e);
        console.log('🔄 [WebSocket] PhaseChanged event data:', JSON.stringify(e, null, 2));
        const oldPhase = phase.value;
        const oldStatus = currentGame.value?.status;
        const phaseChanged = e.phase !== phase.value;
        
        if (phaseChanged) {
          console.log('🔄 [WebSocket] Phase changed via WebSocket:', oldPhase, '->', e.phase);
          // Arrêter le timer précédent quand la phase change
          stopTimer();
        }
        
        // CORRECTION: PhaseChanged est la source de vérité pour les changements de phase
        // Ne pas ignorer même si c'est un "retour en arrière" - le backend sait ce qu'il fait
        // (sauf pour lobby et game_end qui sont des phases spéciales)
        // FLOW CANON: Ordre des phases
        const phaseOrder = ['lobby', 'role_reveal', 'night_start', 'night_cupid', 'night_wolves', 'night_guard', 'night_witch', 'night_seer', 'night_processing', 'day_reveal', 'day_debate', 'day_vote', 'day_vote_result', 'day_last_words', 'day_execution', 'game_end'];
        const currentIndex = phaseOrder.indexOf(phase.value);
        const newIndex = phaseOrder.indexOf(e.phase);
        
        // Ne pas accepter un retour en arrière sauf si c'est lobby ou game_end
        // Mais accepter si c'est un changement normal vers l'avant
        if (newIndex >= 0 && currentIndex >= 0 && newIndex < currentIndex && e.phase !== 'lobby' && e.phase !== 'game_end') {
          console.warn('⚠️ [WebSocket] Ignoring phase rollback via PhaseChanged:', phase.value, '->', e.phase);
          return; // Ne pas mettre à jour
        }
        
        // CORRECTION CRITIQUE: Mettre à jour la phase immédiatement - PhaseChanged est la source de vérité
        // Mais ne JAMAIS revenir à role_reveal une fois qu'on l'a quitté
        if (e.phase === 'role_reveal' && hasLeftRoleReveal.value) {
          console.warn('⚠️ [WebSocket] Ignoring PhaseChanged to role_reveal (hasLeftRoleReveal = true)');
          return; // Ne pas mettre à jour
        }
        
        phase.value = e.phase;
        
        // Marquer qu'on a quitté role_reveal si on passe à une autre phase
        if (e.phase !== 'role_reveal' && e.phase !== 'lobby') {
          hasLeftRoleReveal.value = true;
        } else if (e.phase === 'lobby') {
          // CORRECTION: Reset le flag quand on revient au lobby
          hasLeftRoleReveal.value = false;
        }
        
        // Mettre à jour aussi currentGame avec toutes les données de l'événement
        if (currentGame.value) {
          currentGame.value.phase = e.phase;
          currentGame.value.status = e.status || currentGame.value.status;
          
          // Mettre à jour avec toutes les données du jeu si disponibles
          if (e.game) {
            currentGame.value = { 
              ...currentGame.value, 
              ...e.game,
              // Préserver l'ID et les relations importantes
              id: e.game.id || currentGame.value.id,
              players: e.game.players || currentGame.value.players
            };
            // CORRECTION: S'assurer que le state est bien mis à jour (important pour vote_result, wolves_target_id, etc.)
            if (e.game.state) {
              currentGame.value.state = { ...(currentGame.value.state || {}), ...e.game.state };
            }
            updatePlayers(e.game.players || currentGame.value.players || []);
          }
        }
        
        // Démarrer le timer si phase_ends_at existe et phase a changé
        const phasesWithoutTimer = ['game_end', 'lobby'];
        const phaseEndsAt = e.game?.phase_ends_at || currentGame.value?.phase_ends_at;
        
        if (phaseEndsAt && !phasesWithoutTimer.includes(e.phase)) {
          const endTime = new Date(phaseEndsAt).getTime();
          const now = new Date().getTime();
          
          if (endTime > now) {
            console.log('⏰ [WebSocket] Starting timer from PhaseChanged:', phaseEndsAt);
            startTimer(phaseEndsAt);
          } else {
            console.log('⚠️ [WebSocket] phase_ends_at is in the past:', new Date(phaseEndsAt).toISOString());
            stopTimer();
          }
        } else {
          stopTimer();
        }
        
        console.log('✅ [WebSocket] Phase updated:', oldPhase, '->', e.phase, 'Status:', oldStatus, '->', e.status || currentGame.value?.status);
      })
      .listen('.PlayerKilled', (e) => {
        // Mettre à jour le statut du joueur
        const player = players.value.find(p => p.id === e.player_id);
        if (player) {
          player.is_alive = false;
        }
        
        // Si c'est nous
        if (e.player_id === currentPlayer.value?.id) {
          isAlive.value = false;
        }
      });
    
    // Écouter les messages privés (rôle)
    if (currentPlayer.value?.user_id) {
      echoInstance.private(`user.${currentPlayer.value.user_id}`)
        .listen('RoleAssigned', (e) => {
          myRole.value = e.role;
          if (currentPlayer.value) {
            currentPlayer.value.role = e.role;
          }
        });
    }
  }
  
  function joinChatChannel(channel) {
    if (!currentGame.value) {
      console.log('⚠️ [Chat] Cannot join chat channel, no current game');
      return;
    }
    
    const echoInstance = initializeEcho();
    if (!echoInstance) {
      console.log('⚠️ [Chat] Cannot join chat channel, Echo not initialized');
      return;
    }
    
    const chatChannelName = `game.${currentGame.value.id}.chat.${channel}`;
    console.log('📡 [Chat] Subscribing to private channel:', chatChannelName);
    
    // Channel privé nécessitant autorisation (défini avec Broadcast::channel())
    const chatChannel = echoInstance.private(chatChannelName);
    
    chatChannel
      .listen('.ChatMessage', (e) => {
        console.log('💬 [Chat] ChatMessage event received:', e);
        console.log('💬 [Chat] ChatMessage event data:', JSON.stringify(e, null, 2));
        chatMessages.value.push({
          id: e.id,
          user: e.user,
          user_id: e.user_id,
          content: e.content,
          channel: channel,
          timestamp: e.timestamp
        });
        console.log('💬 [Chat] Message added to chatMessages, total:', chatMessages.value.length);
      });
    
    console.log('✅ [Chat] Chat channel subscription set up for:', chatChannelName);
  }
  
  function addSystemMessage(content, channel = 'lobby') {
    const systemMessage = {
      id: `system-${Date.now()}-${Math.random()}`,
      user: null,
      user_id: null,
      content: content,
      channel: channel,
      is_system: true,
      timestamp: new Date().toISOString()
    };
    chatMessages.value.push(systemMessage);
  }
  
  function updatePlayers(gamePlayers) {
    players.value = gamePlayers;
    
    // Obtenir l'user_id depuis authStore
    const authStore = useAuthStore();
    const userIdToFind = authStore.user?.id || currentPlayer.value?.user_id;
    
    if (userIdToFind) {
      const userPlayer = gamePlayers.find(p => p.user_id === userIdToFind);
      if (userPlayer) {
        // Préserver les métadonnées de confirmation si elles existent déjà
        const previousMetadata = currentPlayer.value?.metadata;
        const newMetadata = userPlayer.metadata || {};
        
        // Si le joueur avait déjà confirmé, préserver cette information
        if (previousMetadata?.role_revealed && !newMetadata.role_revealed) {
          newMetadata.role_revealed = true;
          userPlayer.metadata = newMetadata;
        }
        
        currentPlayer.value = userPlayer;
        isAlive.value = userPlayer.is_alive;
        myRole.value = userPlayer.role;
      }
    }
  }
  
  let currentTimerInterval = null;
  
  function startTimer(endsAt) {
    if (!endsAt) {
      console.warn('⚠️ startTimer called without endsAt');
      return;
    }
    
    // Arrêter le timer précédent si existant
    if (currentTimerInterval) {
      clearInterval(currentTimerInterval);
      currentTimerInterval = null;
    }
    
    const endTime = new Date(endsAt).getTime();
    const now = new Date().getTime();
    
    // Vérifier si la date est déjà dans le passé
    if (endTime <= now) {
      console.log('⚠️ phase_ends_at is in the past:', new Date(endsAt).toISOString());
      timer.value = 0;
      return;
    }
    
    console.log('⏰ Starting timer, ends at:', new Date(endsAt).toLocaleTimeString());
    
    const updateTimer = () => {
      const nowTime = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - nowTime) / 1000));
      timer.value = remaining;
      
      if (remaining > 0) {
        currentTimerInterval = setTimeout(updateTimer, 1000);
      } else {
        console.log('⏰ Timer expired');
        currentTimerInterval = null;
        timer.value = 0;
        
        // FLOW CANON: Quand le timer expire, appeler IMMÉDIATEMENT l'API pour vérifier/forcer l'avancement de phase
        // Pour les phases sans action, le backend doit avancer immédiatement
        if (currentGame.value) {
          // Appeler immédiatement sans délai pour les phases sans action
          const currentPhase = phase.value;
          // FLOW CANON: Phases sans action requise
          const phasesWithoutAction = ['day_reveal', 'day_debate', 'day_vote_result', 'day_last_words', 'night_processing'];
          const shouldCheckImmediately = phasesWithoutAction.includes(currentPhase);
          
          const checkExpiredPhase = async () => {
            // Vérifier si la phase a changé depuis l'expiration du timer
            if (currentGame.value && phase.value === currentGame.value.phase) {
              console.log('⚠️ [Timer] Phase unchanged after expiration, checking backend...', currentPhase);
              try {
                // Appeler l'endpoint checkExpiredPhase pour forcer l'avancement si nécessaire
                const response = await axios.post(`/games/${currentGame.value.id}/check-expired-phase`);
                if (response.data.success) {
                  // Mettre à jour le jeu même si la phase n'a pas changé (pour mettre à jour le timer, etc.)
                  if (response.data.game) {
                    const backendPhase = response.data.game.phase;
                    if (backendPhase && backendPhase !== phase.value) {
                      console.log('🔄 [Timer] Backend phase differs after check, updating:', phase.value, '->', backendPhase);
                      // Le backend a avancé la phase, mettre à jour
                      phase.value = backendPhase;
                      currentGame.value = response.data.game;
                      updatePlayers(response.data.game.players || []);
                      
                      // Si la phase a changé, mettre à jour le timer
                      if (response.data.game.phase_ends_at) {
                        const endTime = new Date(response.data.game.phase_ends_at).getTime();
                        const now = new Date().getTime();
                        if (endTime > now) {
                          startTimer(response.data.game.phase_ends_at);
                        }
                      }
                    } else {
                      console.log('ℹ️ [Timer] Backend phase matches frontend, waiting for PhaseChanged event...');
                      // Mettre à jour quand même le jeu pour avoir les dernières données
                      currentGame.value = response.data.game;
                      updatePlayers(response.data.game.players || []);
                    }
                  }
                }
              } catch (error) {
                console.error('❌ [Timer] Error checking expired phase:', error);
                // Si l'erreur est 403 (pas une partie de test), c'est normal, ignorer
                if (error.response?.status !== 403) {
                  console.error('❌ [Timer] Unexpected error:', error);
                }
              }
            }
          };
          
          if (shouldCheckImmediately) {
            // Pour les phases sans action, vérifier immédiatement
            console.log('⏰ [Timer] Phase without action expired, checking immediately...', currentPhase);
            checkExpiredPhase();
          } else {
            // Pour les phases avec action, attendre 1 seconde pour laisser le backend avancer
            console.log('⏰ [Timer] Phase with action expired, checking in 1 second...', currentPhase);
            setTimeout(checkExpiredPhase, 1000);
          }
        }
      }
    };
    
    updateTimer();
  }
  
  function stopTimer() {
    if (currentTimerInterval) {
      clearInterval(currentTimerInterval);
      currentTimerInterval = null;
    }
    timer.value = 0;
  }
  
  
  function resetGame() {
    currentGame.value = null;
    currentPlayer.value = null;
    players.value = [];
    phase.value = 'lobby';
    timer.value = 0;
    myRole.value = null;
    isAlive.value = true;
    chatMessages.value = [];
    gameState.value = {};
    hasLeftRoleReveal.value = false; // CORRECTION: Reset le flag quand on reset le jeu

    // Réinitialiser les souscriptions
    subscribedChannels.clear();

    // Quitter tous les channels
    if (echo) {
      echo.leaveAllChannels();
    }
  }
  
  return {
    // State
    currentGame,
    currentPlayer,
    players,
    phase,
    timer,
    myRole,
    isAlive,
    chatMessages,
    gameState,
    hasLeftRoleReveal, // CORRECTION: Exporter le flag pour GameView
    
    // Computed
    isHost,
    livingPlayers,
    deadPlayers,
    canAct,
    
    // Actions
    createGame,
    joinGame,
    startGame,
    submitAction,
    toggleReady,
    leaveGame,
    confirmRoleReveal,
    joinGameChannel,
    joinChatChannel,
    addSystemMessage,
    resetGame,
    startTimer
  };
});

