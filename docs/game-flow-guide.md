# Guide Game Flow (refonte design)

## Vue d'ensemble du front
- Stack: Vue 3 + Pinia + vue-router + axios + laravel-echo/pusher, animations lucide-vue-next.
- Points d'entree: [js/app.js](js/app.js) charge [js/main.js](js/main.js) qui instancie App.vue + Pinia + router + MotionPlugin.
- Layout racine: [js/App.vue](js/App.vue) gere la transition des vues et les notifications globales (showNotification exposee sur window).
- Routage: [js/router/index.js](js/router/index.js) -> routes home, lobby/:code (auth), game/:id (auth), join/:code (redirect).
- Stores: [js/stores/authStore.js](js/stores/authStore.js) (login Google/Firebase -> backend /auth/firebase, token localStorage) et [js/stores/gameStore.js](js/stores/gameStore.js) (etat de partie, phases, timers, websockets Reverb/Echo, actions, chat systeme).
- Styles globaux: [css/app.css](css/app.css) (theme, utilitaires, glassmorphism, reset) + [css/animations.css](css/animations.css) + [css/responsive.css](css/responsive.css). Blade monte #app via [views/app.blade.php](views/app.blade.php).

## Cycle de vie d'une partie
- Phase order (canon gameStore): lobby -> role_reveal -> night_start -> night_cupid -> night_wolves -> night_guard -> night_witch -> night_seer -> night_processing -> day_reveal -> day_debate -> day_vote -> day_vote_result -> day_last_words -> day_execution -> game_end.
- Source de verite: evenements websocket `.PhaseChanged` privates game.{id}.state (GameStore met a jour phase, state, timer phase_ends_at). Timer local relance check `/games/{id}/check-expired-phase` a expiration.
- Fallback navigation: [js/views/GameView.vue](js/views/GameView.vue) selectionne le composant de phase en fonction de gameStore.phase/status et du flag hasLeftRoleReveal.

### Phases et composants clefs
- Lobby: [js/views/LobbyView.vue](js/views/LobbyView.vue) (grid joueurs PlayerCard, chat lobby, pret/host, QR code, kick/transfer host). Actions: toggleReady(), startGame().
- Role reveal: [js/components/Game/RoleReveal.vue](js/components/Game/RoleReveal.vue) (carte tarot flip, confirmRoleReveal()). Flag hasLeftRoleReveal evite retours.
- Transitions de nuit: [js/components/Game/NightStart.vue](js/components/Game/NightStart.vue), [js/components/Game/NightSleep.vue](js/components/Game/NightSleep.vue), [js/components/Game/NightProcessing.vue](js/components/Game/NightProcessing.vue), [js/components/Game/NightEnd.vue](js/components/Game/NightEnd.vue).
- Actions de nuit:
  - Cupidon: [js/components/Game/CupidPhase.vue](js/components/Game/CupidPhase.vue) select 2 lovers -> submitAction('cupid_match').
  - Loups: [js/components/Game/NightPhase.vue](js/components/Game/NightPhase.vue) en mode werewolf -> kill_vote sur non loups + chat meute wolves.
  - Garde: [js/components/Game/GuardPhase.vue](js/components/Game/GuardPhase.vue) protect (pas soi ni lastProtectedId) -> submitAction('protect').
  - Sorciere: [js/components/Game/WitchPhase.vue](js/components/Game/WitchPhase.vue) voit wolves_target_id, potions heal/kill -> submitAction('witch_potion', ...).
  - Voyante: [js/components/Game/SeerPhase.vue](js/components/Game/SeerPhase.vue) reveal_role sur une cible -> affiche role.
  - Chasseur (si mort): [js/components/Game/HunterAction.vue](js/components/Game/HunterAction.vue) hunter_shoot optionnel.
- Reveil jour: [js/components/Game/DayReveal.vue](js/components/Game/DayReveal.vue) ou [js/components/Game/DayStart.vue](js/components/Game/DayStart.vue) liste night_deaths + Timer.
- Debat/vote: [js/components/Game/DayPhase.vue](js/components/Game/DayPhase.vue) debate -> chat global; vote -> PlayerCard selection -> submitAction('day_vote').
- Resultat vote: [js/components/Game/VoteResult.vue](js/components/Game/VoteResult.vue) affiche vote_result (inclut cas Fool victoire) et recolte historique actions (/games/{id}/actions).
- Dernieres paroles: [js/components/Game/DayLastWords.vue](js/components/Game/DayLastWords.vue) sur vote_result.target.
- Execution: [js/components/Game/DayExecution.vue](js/components/Game/DayExecution.vue) revele role du condamne.
- Fin de partie: [js/components/Game/GameEnd.vue](js/components/Game/GameEnd.vue) affiche vainqueur (village/loups/fool/lovers/draw), winners listes, bouton retour home -> resetGame().

### Chats
- Composant: [js/components/Chat/ChatBox.vue](js/components/Chat/ChatBox.vue) + [ChatBubble](js/components/Chat/ChatBubble.vue). Channels: lobby/global/wolves/dead; join via gameStore.joinChatChannel(channel) (private channel game.{id}.chat.{channel}). Cooldown simple et quick reactions. gameStore.chatMessages alimente vues.

### UI generiques
- Boutons: [js/components/UI/ActionButton.vue](js/components/UI/ActionButton.vue) variants primary/secondary/danger/magic/gold/emerald, glow, loading.
- Timer: [js/components/UI/Timer.vue](js/components/UI/Timer.vue) variants circular/digital/minimal, autosync sur gameStore.timer ou phaseEndsAt (stroke-dash progress + etats urgent/critical).
- PlayerCard: [js/components/Player/PlayerCard.vue](js/components/Player/PlayerCard.vue) cartes glass, badges host/ready/dead, selection couleur.

## Etat & reseau
- Auth: Firebase Google + token backend (Sanctum) stocke dans localStorage; axios baseURL '/api' ([js/bootstrap.js](js/bootstrap.js)). Garde router requiresAuth utilise authStore.fetchUserInfo().
- Websocket: Echo Reverb (wsHost/Port variables VITE_REVERB_*). Authorizer sur /broadcasting/auth avec bearer token. gameStore subscribe private game.{id}.state pour GameUpdated/PhaseChanged/GameDeleted/PlayerKilled; private user.{userId} pour RoleAssigned; private chat channels.
- Actions HTTP principales (gameStore): createGame/joinGame/startGame/toggleReady/confirmRoleReveal/submitAction(type,target,data)/leaveGame plus checkExpiredPhase par timer.
- State derivations: isHost, livingPlayers, deadPlayers, canAct (phase+role logique). hasLeftRoleReveal evite retour a role_reveal.

## Styles & design existants
- Theme sombre glass + neon (variables couleur role) via app.css; nombreux utilitaires "force flex" et typographie Cinzel/Playfair/Inter.
- Animations predef: transitions fade/scale/slide, keyframes aurora/glow/pulse/shimmer/timer/role-specific (wolf-hunt, seer-vision...).
- Responsive: [css/responsive.css](css/responsive.css) définit grilles player/chat, action bar mobile, layout desktop (grid content + side panel) + reduced-motion.

## Points d'attention pour refonte design
- Harmoniser palette et effets glass (actuellement repete dans chaque composant; factoriser via classes theme). Extraire gradients de fond par phase dans une couche globale (eviter duplication dans chaque .vue).
- Repenser hiérarchie typographique: beaucoup de textes forcés inline/block dans app.css et HomeView; nettoyer pour laisser Tailwind ou classes dediees.
- Timers et cards: mutualiser glass-card, vignette, orbs; prevoir tokens design pour roles (couleur/icon) pour reutilisation.
- Accessibilite: contrastes suffisant, focus states manquants sur boutons/inputs; ajouter aria-live pour notifications.
- Performance: animations nombreuses (flou, box-shadow); prevoir mode low-motion (deja media reduce mais peu applique sur components). Optimiser images roles (RoleReveal) et gradients lourds.
- Reseau: prevoir etats offline/retry pour Echo et axios; message clair si Reverb absent (gameStore.initializeEcho deja log).

## Direction artistique (Dark Folklore)
- Palette cible: Charcoal Black `#121212`, Burnt Orange `#D97706`, Blood Red `#991B1B`, Parchment Beige `#F5F5DC`. Utiliser ces valeurs comme tokens CSS (ex: --color-bg-charcoal, --color-accent-burnt, --color-accent-blood, --color-paper).
- Textures: ajouter un grain fin (noise) en overlay basse opacité sur les backgrounds; cadres et boutons avec bords irréguliers (simulé via SVG inset shadow ou mask). Pas de gloss.
- Typo: conserver "Inter" pour corps/inputs/chat; "Cinzel" pour titres, noms joueurs, headers de phase.
- Icono/motifs: linogravure/woodcut. Prévoir pictos simples (œil voyante, loup, cœur, bouclier) en style trait ou assets monochromes.

## Patterns UI par zone
- ROLE CARD (RoleReveal): cadre tarot central avec bord noir épais, effet bois/pierre (texture ou border-image SVG). Fond parchment beige très léger derrière l'illustration. Bouton de confirmation = sceau de cire (Burnt Orange) avec texte Cinzel.
- PLAYER GRID: portraits carrés. Etat mort: passer en désaturé + overlay vignette sombre ou remplacer par icône pierre tombale. Halo de sélection en Burnt Orange pour actions de vote/sélection.
- BUTTONS: styles cire/bois, sans gloss. Variants: primaire Burnt Orange avec texture papier/cire, danger Blood Red, neutre charbon. Ajouter état focus visible (contour beige).
- CHAT: fond transparent/grain, Inter pour messages, Cinzel pour noms/headers. Bordure fine noir charbon, surlignage des system messages en beige/gris.

## Spécifiques écrans demandés
- Night Phase: overlay bleu nuit texturé (ajouter layer grain). Intégrer motif œil "Seer" dans animation reveal (ex: pseudo-élément pulsant derrière la cible). Utiliser icônes loup/garde/sorcier monochromes.
- Day Reveal: transition dark -> sépia matin (gradient charcoal -> parchment). Afficher assets Voyante/Chasseur (.webp) en cadre circulaire avec bord noir épais et halo Burnt Orange léger.
- RoleReveal: appliquer frame tarot, fond parchment, flip conserve texture bois; bouton "J'accepte" en sceau cire.
- Lobby/Home: remplacer orbs néon par aplats texturés charbon + lueurs Burnt Orange subtiles; titres Cinzel, boutons bois/cire.

## Implémentation rapide (ordre)
1) Ajouter tokens palette/texture dans css/app.css (section theme). Définir classes utilitaires: .bg-charcoal, .paper-card (fond parchment + grain), .frame-wood (border-image SVG), .btn-seal, .noise-overlay.
2) Créer une couche layout phase (ex: `LayoutPhase.vue` wrapper) avec backgrounds par phase (night/day) pour retirer les duplications de gradients dans les composants.
3) Mettre à jour RoleReveal, NightPhase, DayReveal, GameEnd, PlayerCard, ActionButton, ChatBox pour utiliser tokens et styles (cadres, boutons, chat transparent, portraits morts).
4) Ajouter assets motifs (œil, tombe, sceau) en monochrome SVG; utiliser en background-image ou <img> avec filter grayscale.
5) Passer responsive: conserver grilles existantes mais vérifier contrastes et poids des textures sur mobile (réduire grain en @media max-width).

## Next step
- Utiliser ce guide pour dessiner un storyboard UI par phase (background, pane principale, side chat/panels), puis definir un design system (tokens couleurs, typographie, radius, ombres, components primaires) et l'appliquer aux composants ci-dessus.
