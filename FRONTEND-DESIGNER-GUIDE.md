# 🎨 GUIDE COMPLET POUR LE DESIGNER FRONTEND
## Loup-Garou - Grimm Folklore Edition

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Flow utilisateur complet](#flow-utilisateur-complet)
4. [Rôles du jeu - Détails complets](#rôles-du-jeu)
5. [Phases du jeu - Détails exhaustifs](#phases-du-jeu)
6. [API Backend - Documentation complète](#api-backend)
7. [Structure des données](#structure-des-données)
8. [Design System - Grimm Folklore](#design-system)
9. [Flow de refonte du design](#flow-de-refonte)
10. [Fichiers à modifier/créer](#fichiers-à-modifier)
11. [Instructions de travail](#instructions-de-travail)

---

## 1. VUE D'ENSEMBLE {#vue-densemble}

### Contexte
Application web de jeu de société "Loup-Garou" (Werewolf) en temps réel avec design "Grimm Folklore". Le backend est en **Laravel (PHP)** et le frontend en **Vue 3** avec **Composition API**.

### Stack technique
- **Backend**: Laravel 11, PHP 8.2+, MySQL
- **Frontend**: Vue 3, Pinia (state management), Vue Router
- **Real-time**: Laravel Echo + Pusher (ou Laravel WebSockets)
- **Authentification**: Firebase Authentication + Laravel Sanctum
- **Build**: Vite
- **Styles**: CSS custom properties (variables CSS)

### Structure du projet
```
levillage/
├── app/                    # Backend Laravel
│   ├── Game/
│   │   ├── Engine/         # Moteur de jeu (GameEngine, StateMachine, etc.)
│   │   └── Roles/          # Classes des rôles (Witch, Seer, etc.)
│   ├── Http/Controllers/   # Contrôleurs API
│   └── Models/             # Modèles Eloquent
├── resources/
│   ├── js/
│   │   ├── views/          # Pages principales (HomeView, LobbyView, GameView)
│   │   ├── components/     # Composants Vue réutilisables
│   │   └── stores/         # Stores Pinia (gameStore, authStore)
│   └── css/                # Styles CSS
└── routes/
    ├── api.php             # Routes API
    └── web.php             # Routes web
```

---

## 2. ARCHITECTURE TECHNIQUE {#architecture-technique}

### Backend (Laravel)

#### Modèles de données principaux

**Game** (Partie)
- `id`: Identifiant unique
- `code`: Code à 5 caractères (ex: "ABC12")
- `status`: 'lobby' | 'night' | 'day' | 'voting' | 'ended'
- `phase`: Phase actuelle (voir phases ci-dessous)
- `day_number`: Numéro du jour (1 = première nuit)
- `config`: JSON (host_id, player_count, is_test)
- `state`: JSON (données temporaires du jeu)
- `phase_ends_at`: DateTime (expiration de la phase)
- Relations: `players()`, `actions()`, `messages()`

**GamePlayer** (Joueur dans une partie)
- `id`: Identifiant unique
- `game_id`: ID de la partie
- `user_id`: ID de l'utilisateur
- `role`: Rôle assigné (voir rôles ci-dessous)
- `is_alive`: Boolean (vivant/mort)
- `is_protected`: Boolean (protégé par le garde)
- `is_lover`: Boolean (amoureux)
- `lover_id`: ID de l'amoureux
- `metadata`: JSON (données spécifiques au rôle)
- Relations: `game()`, `user()`, `lover()`

**Action** (Action effectuée)
- `id`: Identifiant unique
- `game_id`: ID de la partie
- `round`: Numéro du round (day_number)
- `type`: Type d'action (voir actions ci-dessous)
- `player_id`: ID du joueur qui agit
- `target_id`: ID de la cible (nullable)
- `data`: JSON (données additionnelles)
- `processed`: Boolean (traitée ou non)
- Relations: `game()`, `player()`, `target()`

**Message** (Message de chat)
- `id`: Identifiant unique
- `game_id`: ID de la partie
- `user_id`: ID de l'utilisateur
- `channel`: 'global' | 'wolves' | 'dead' | 'lobby'
- `content`: Contenu du message
- Relations: `game()`, `user()`

#### Moteur de jeu

**StateMachine** (`app/Game/Engine/StateMachine.php`)
- Gère les transitions entre phases
- Détermine automatiquement la phase suivante
- Programme les timers automatiques
- Émet les événements de transition

**GameEngine** (`app/Game/Engine/GameEngine.php`)
- Logique principale du jeu
- Assignation des rôles
- Traitement des actions
- Résolution des morts
- Vérification des conditions de victoire

**PhaseManager** (`app/Game/Engine/PhaseManager.php`)
- Durées des phases
- Vérification si tous les joueurs ont agi
- Liste des joueurs qui doivent agir

### Frontend (Vue 3)

#### Stores Pinia

**gameStore** (`resources/js/stores/gameStore.js`)
- `currentGame`: Données de la partie actuelle
- `currentPlayer`: Joueur actuel
- `players`: Liste des joueurs
- `phase`: Phase actuelle
- Méthodes: `fetchGame()`, `createGame()`, `joinGame()`, `submitAction()`, etc.

**authStore** (`resources/js/stores/authStore.js`)
- `user`: Utilisateur connecté
- `isAuthenticated`: Boolean
- Méthodes: `login()`, `logout()`

#### Vue Router

- `/` (HomeView): Accueil, authentification, création/rejoindre partie
- `/lobby/:code` (LobbyView): Lobby avant le début de la partie
- `/game/:id` (GameView): Vue principale du jeu

#### Composants principaux

**Pages (views/)**
- `HomeView.vue`: Page d'accueil
- `LobbyView.vue`: Lobby
- `GameView.vue`: Vue principale du jeu (router vers composants de phase)

**Composants de phase (components/Game/)**
- `RoleReveal.vue`: Révélation du rôle
- `NightStart.vue`: Début de nuit
- `NightPhase.vue`: Phase des loups
- `CupidPhase.vue`: Phase de Cupidon
- `GuardPhase.vue`: Phase du garde
- `WitchPhase.vue`: Phase de la sorcière
- `SeerPhase.vue`: Phase de la voyante
- `NightSleep.vue` / `NightProcessing.vue`: Processing de nuit
- `HunterAction.vue`: Action du chasseur (nuit)
- `NightEnd.vue`: Fin de nuit
- `DayStart.vue` / `DayReveal.vue`: Révélation des morts
- `DayPhase.vue`: Phase de jour (débat + vote)
- `VoteResult.vue`: Résultat du vote
- `DayLastWords.vue`: Derniers mots
- `DayExecution.vue`: Exécution
- `HunterDayAction.vue`: Action du chasseur (jour)
- `GameEnd.vue`: Fin de partie

**Composants UI**
- `ActionButton.vue`: Bouton d'action stylisé
- `PlayerCard.vue`: Carte de joueur
- `ChatBox.vue`: Boîte de chat
- `ChatBubble.vue`: Bulle de chat
- `Timer.vue`: Compte à rebours

---

## 3. FLOW UTILISATEUR COMPLET {#flow-utilisateur-complet}

### 3.1. Authentification et Accueil

**Route**: `/` (HomeView.vue)

**États**:
1. **Non connecté**
   - Affiche: "Authentication Required"
   - Bouton: "CONNECT IDENTITY"
   - Action: Ouvre Firebase Auth (Google)

2. **Connecté**
   - Affiche: Avatar avec initiale, nom utilisateur, badge "ACCESS GRANTED"
   - Actions:
     - Bouton "INITIATE GAME": Ouvre modal création (8/10/12 joueurs)
     - Input "Code de partie" + Bouton "JOIN": Rejoint une partie existante
     - Bouton "DÉCONNEXION": Déconnecte l'utilisateur

**API utilisée**: 
- `POST /api/auth/firebase`: Authentification Firebase
- `POST /api/games`: Créer une partie
- `POST /api/games/{code}/join`: Rejoindre une partie

### 3.2. Lobby (Attente avant la partie)

**Route**: `/lobby/:code` (LobbyView.vue)

**Éléments visuels**:
- **Header**: Code de la partie (grand), boutons (copier, QR code, quitter)
- **Grille de joueurs**: Cartes des joueurs présents + emplacements vides
- **Chat**: Zone de chat (channel "lobby")
- **Footer**: 
  - Si hôte: Bouton "DÉMARRER" (actif si tous prêts + min 6 joueurs)
  - Si joueur: Bouton "CONFIRM READINESS" / "ANNULER PRÊT"

**Actions utilisateur**:
- Cliquer sur "prêt": Bascule l'état ready
- Hôte: Cliquer sur "DÉMARRER" lance la partie
- Chat: Envoyer des messages dans le lobby

**API utilisée**:
- `GET /api/games/{game}`: Récupérer l'état de la partie
- `POST /api/games/{game}/ready`: Basculer l'état ready
- `POST /api/games/{game}/start`: Démarrer la partie (hôte uniquement)
- `POST /api/games/{game}/leave`: Quitter la partie
- `POST /api/games/{game}/messages`: Envoyer un message
- `GET /api/games/{game}/messages/{channel}`: Récupérer les messages

**Événements WebSocket** (Laravel Echo):
- `.GameUpdated`: Mise à jour de la partie (joueur rejoint, ready, etc.)
- `.PhaseChanged`: La partie démarre (transition vers `role_reveal`)
- `.GameDeleted`: La partie a été supprimée

**Transition automatique**:
- Quand tous les joueurs sont prêts + hôte démarre → Transition vers `role_reveal`

### 3.3. Révélation du Rôle

**Phase**: `role_reveal`

**Route**: `/game/:id` (GameView.vue → RoleReveal.vue)

**Durée**: 15 secondes (ou jusqu'à confirmation de tous)

**Affichage**:
- Écran plein avec révélation du rôle du joueur
- Carte de rôle avec:
  - Icône/Image du rôle
  - Nom du rôle
  - Description du rôle
  - Équipe (Villageois / Loups)
- Bouton "J'AI VU MON RÔLE" (confirmation)

**Logique**:
- Chaque joueur doit confirmer avoir vu son rôle
- La phase avance automatiquement quand tous ont confirmé (ou après 15s)
- Les joueurs voient le progrès (X/Y joueurs ont confirmé)

**API utilisée**:
- `POST /api/games/{game}/confirm-role-reveal`: Confirmer la révélation

**Transition**: → `night_cupid` (première nuit)

### 3.4. Phases de Nuit

#### 3.4.1. Nuit 1 - Cupidon (Conditionnel)

**Phase**: `night_cupid`

**Durée**: 20 secondes

**Visibilité**: Seulement pour le joueur Cupidon

**Affichage**:
- Écran sombre (nuit)
- Titre: "Phase de Cupidon"
- Description: "Liez deux joueurs en amoureux"
- Liste des joueurs vivants (cartes cliquables)
- Interface de sélection: 2 joueurs à sélectionner
- Bouton "CONFIRMER" (actif si 2 joueurs sélectionnés)

**Action**: Sélectionner 2 joueurs différents

**API utilisée**:
- `POST /api/games/{game}/actions`:
  ```json
  {
    "type": "cupid_match",
    "data": {
      "player1_id": 1,
      "player2_id": 2
    }
  }
  ```

**Transition**: → `night_wolves`

**Note**: Cette phase n'apparaît QUE la première nuit (day_number = 1). Si Cupidon est mort ou n'existe pas, la phase est skippée.

#### 3.4.2. Phase des Loups

**Phase**: `night_wolves`

**Durée**: 30 secondes

**Visibilité**: Seulement pour les joueurs Loups-Garous

**Affichage**:
- Écran sombre (nuit)
- Titre: "Phase des Loups-Garous"
- Description: "Votez pour une victime"
- Liste des joueurs vivants SAUF les autres loups (cartes cliquables)
- Chat privé: Channel "wolves" (visible seulement aux loups)
- Vote: Sélectionner un joueur
- Affichage des votes des autres loups (en temps réel via chat)

**Action**: Voter pour un joueur à dévorer

**API utilisée**:
- `POST /api/games/{game}/actions`:
  ```json
  {
    "type": "kill_vote",
    "target_id": 3
  }
  ```

**Logique backend**:
- Vote majoritaire (si égalité, personne n'est tué)
- La cible est stockée dans `game.state.wolves_target_id`

**Transition**: → `night_guard`

**Note**: Si aucun loup n'est vivant, la phase est skippée.

#### 3.4.3. Phase du Garde

**Phase**: `night_guard`

**Durée**: 20 secondes

**Visibilité**: Seulement pour le joueur Garde

**Affichage**:
- Écran sombre (nuit)
- Titre: "Phase du Garde"
- Description: "Protégez un joueur des loups"
- Liste des joueurs vivants SAUF le garde lui-même
- Indication: "Vous ne pouvez pas protéger le même joueur deux nuits consécutives"
- Affichage du dernier joueur protégé (si applicable)
- Sélection: Cliquer sur un joueur

**Action**: Protéger un joueur

**Contraintes**:
- Ne peut pas protéger le même joueur deux nuits consécutives
- Ne peut pas se protéger lui-même

**API utilisée**:
- `POST /api/games/{game}/actions`:
  ```json
  {
    "type": "protect",
    "target_id": 4
  }
  ```

**Transition**: → `night_witch`

**Note**: Si le garde est mort, la phase est skippée.

#### 3.4.4. Phase de la Sorcière

**Phase**: `night_witch`

**Durée**: 25 secondes

**Visibilité**: Seulement pour le joueur Sorcière

**Affichage**:
- Écran sombre (nuit)
- Titre: "Phase de la Sorcière"
- Description: "Les loups ont choisi: [Nom du joueur]"
- Affichage de la victime des loups (depuis `game.state.wolves_target_id`)
- Options:
  - **Potion de vie** (si disponible): Sauver la victime des loups
  - **Potion de mort** (si disponible): Tuer un joueur
  - **Passer**: Ne rien faire
- Indicateurs: État des potions (utilisées/disponibles)

**Actions possibles**:
1. Utiliser potion de vie: Sauver la victime des loups
2. Utiliser potion de mort: Sélectionner un joueur à tuer + confirmer
3. Passer: Ne rien faire

**API utilisée**:
- `POST /api/games/{game}/actions`:
  - Sauver: `{"type": "witch_potion", "data": {"potion_type": "heal"}}`
  - Tuer: `{"type": "witch_potion", "target_id": 5, "data": {"potion_type": "kill"}}`
  - Passer: `{"type": "witch_potion", "data": {"potion_type": "skip"}}`

**Métadonnées joueur**:
- `metadata.heal_potion`: true/false (disponibilité)
- `metadata.kill_potion`: true/false (disponibilité)

**Transition**: → `night_seer`

**Note**: Si la sorcière est morte, la phase est skippée.

#### 3.4.5. Phase de la Voyante

**Phase**: `night_seer`

**Durée**: 15 secondes

**Visibilité**: Seulement pour le joueur Voyante

**Affichage**:
- Écran sombre (nuit)
- Titre: "Phase de la Voyante"
- Description: "Découvrez le rôle d'un joueur"
- Liste des joueurs vivants SAUF la voyante (cartes cliquables)
- Sélection: Cliquer sur un joueur

**Action**: Sélectionner un joueur pour découvrir son rôle

**Résultat immédiat**:
- Après sélection, afficher le rôle révélé
- Animation de révélation
- Stocker dans l'historique (pour référence plus tard)

**API utilisée**:
- `POST /api/games/{game}/actions`:
  ```json
  {
    "type": "reveal_role",
    "target_id": 6
  }
  ```
- Réponse: `{"revealed_role": "werewolf", "target_player_name": "Joueur X"}`

**Transition**: → `night_processing`

**Note**: Si la voyante est morte, la phase est skippée.

#### 3.4.6. Processing de Nuit

**Phase**: `night_processing`

**Durée**: 3 secondes

**Visibilité**: Tous les joueurs

**Affichage**:
- Écran sombre (nuit)
- Animation de traitement
- Message: "La nuit se termine..."

**Logique backend**:
- Traitement de toutes les actions
- Résolution des morts (via DeathResolver)
- Application des effets (protection, potions, etc.)
- Vérification des conditions de victoire
- Stockage des morts dans `game.state.night_deaths`

**Transition automatique**:
- Si chasseur mort → `hunter_action`
- Sinon → `day_reveal`

#### 3.4.7. Action du Chasseur (Nuit)

**Phase**: `hunter_action`

**Durée**: 20 secondes

**Visibilité**: Seulement pour le chasseur mort

**Condition**: Le chasseur est mort pendant la nuit

**Affichage**:
- Écran sombre (nuit)
- Titre: "Action du Chasseur"
- Description: "Vous êtes mort. Vous pouvez tuer un joueur"
- Liste des joueurs vivants (cartes cliquables)
- Option: "Ne pas tirer"

**Action**: Sélectionner un joueur à tuer (ou passer)

**API utilisée**:
- `POST /api/games/{game}/actions`:
  ```json
  {
    "type": "hunter_shoot",
    "target_id": 7  // ou null pour passer
  }
  ```

**Transition**: → `day_reveal`

**Note**: Si le chasseur ne tire pas ou expire le timer, passe à `day_reveal`.

### 3.5. Phases de Jour

#### 3.5.1. Révélation des Morts

**Phase**: `day_reveal`

**Durée**: 10 secondes

**Visibilité**: Tous les joueurs

**Affichage**:
- Écran jour (claire)
- Titre: "Aube du Jour X"
- Liste des morts de la nuit:
  - Nom du joueur
  - Rôle (révélé)
  - Cause de mort (si visible)
- Animation de révélation
- Bouton "CONTINUER" (ou auto après 10s)

**Données**: `game.state.night_deaths` (array)

**Transition**: → `day_debate`

#### 3.5.2. Débat

**Phase**: `day_debate`

**Durée**: 180 secondes (20s pour les tests)

**Visibilité**: Tous les joueurs vivants

**Affichage**:
- Écran jour
- Titre: "Débat - Jour X"
- Liste des joueurs:
  - Joueurs vivants (cartes)
  - Joueurs morts (cartes grisées)
- Chat global (visible à tous les vivants)
- Timer: Compte à rebours
- Bouton "PASSER AU VOTE" (si hôte, ou auto après timer)

**Actions**:
- Chat: Discuter dans le channel "global"
- Les morts peuvent chatter dans le channel "dead"

**API utilisée**:
- `POST /api/games/{game}/messages`: Envoyer un message
- `GET /api/games/{game}/messages/global`: Récupérer les messages

**Transition**: → `day_vote` (automatique après timer)

#### 3.5.3. Vote

**Phase**: `day_vote`

**Durée**: 30 secondes

**Visibilité**: Tous les joueurs vivants

**Affichage**:
- Écran jour
- Titre: "Vote - Jour X"
- Liste des joueurs vivants (cartes cliquables)
- Sélection: Un seul joueur à sélectionner
- Bouton "VOTER" (actif si joueur sélectionné)
- Indication si vote déjà effectué
- Timer: Compte à rebours

**Action**: Voter pour un joueur à éliminer

**API utilisée**:
- `POST /api/games/{game}/actions`:
  ```json
  {
    "type": "day_vote",
    "target_id": 8
  }
  ```

**Transition automatique**: → `day_vote_result` (quand tous ont voté ou timer expiré)

#### 3.5.4. Résultat du Vote

**Phase**: `day_vote_result`

**Durée**: 5 secondes

**Visibilité**: Tous les joueurs

**Affichage**:
- Écran jour
- Titre: "Résultat du Vote"
- Affichage des votes:
  - Répartition des votes par joueur
  - Joueur le plus voté (surligné)
  - Nombre de votes
- Animation de révélation

**Données**: `game.state.vote_result` (object avec target_id, votes, etc.)

**Transition**:
- Si égalité ou vote blanc → Retour à la nuit suivante
- Si un joueur est éliminé → `day_last_words`

#### 3.5.5. Derniers Mots

**Phase**: `day_last_words`

**Durée**: 10 secondes

**Visibilité**: Tous les joueurs

**Affichage**:
- Écran jour
- Titre: "Derniers Mots"
- Joueur éliminé: Carte du joueur
- Message: "[Nom] peut prononcer ses derniers mots"
- Timer: 10 secondes
- Bouton "CONTINUER" (ou auto)

**Note**: Le joueur éliminé peut encore voir cette phase (mais ne peut pas agir)

**Transition**: → `day_execution`

#### 3.5.6. Exécution

**Phase**: `day_execution`

**Durée**: 15 secondes

**Visibilité**: Tous les joueurs

**Affichage**:
- Écran jour
- Titre: "Exécution"
- Animation d'exécution du joueur éliminé
- Révélation du rôle (si applicable)
- Vérification si chasseur: Si le joueur éliminé est le chasseur → `hunter_day_action`

**Action spéciale**: Si chasseur éliminé, il peut tirer

**API utilisée** (si chasseur):
- `POST /api/games/{game}/actions`:
  ```json
  {
    "type": "hunter_shoot",
    "target_id": 9  // ou null
  }
  ```

**Transition**:
- Si chasseur éliminé et doit tirer → `hunter_day_action`
- Sinon → Vérification victoire → Nuit suivante ou `game_end`

#### 3.5.7. Action du Chasseur (Jour)

**Phase**: `hunter_day_action`

**Durée**: 20 secondes

**Visibilité**: Seulement pour le chasseur éliminé

**Condition**: Le chasseur a été éliminé par vote

**Affichage**: Identique à `hunter_action` (nuit)

**Transition**: → Vérification victoire → Nuit suivante ou `game_end`

### 3.6. Fin de Partie

**Phase**: `game_end`

**Route**: `/game/:id` (GameView.vue → GameEnd.vue)

**Visibilité**: Tous les joueurs

**Affichage**:
- Écran final
- Titre: "FIN DE PARTIE"
- Équipe gagnante:
  - "LES LOUPS ONT GAGNÉ" (rouge)
  - "LES VILLAGEOIS ONT GAGNÉ" (or)
  - "LES AMOUREUX ONT GAGNÉ" (rose/violet)
- Liste des joueurs avec leurs rôles (tous révélés)
- Statut de chaque joueur (vivant/mort)
- Bouton "RETOUR À L'ACCUEIL"

**Données**: `game.state.winner` (string: 'werewolves', 'villagers', 'lovers')

**Transition**: Retour à HomeView

---

## 4. RÔLES DU JEU - DÉTAILS COMPLETS {#rôles-du-jeu}

### 4.1. Loup-Garou (Werewolf) 🐺

**Équipe**: Loups
**Phase de nuit**: `night_wolves`
**Pouvoir**: Vote pour dévorer un villageois chaque nuit

**Mécaniques**:
- Tous les loups votent pour une cible
- Vote majoritaire (en cas d'égalité, personne n'est tué)
- Les loups peuvent se voir entre eux (chat privé "wolves")
- Si plusieurs loups, ils doivent se mettre d'accord

**Victoire**: Éliminer tous les villageois (sans amoureux)

**Affichage pour les loups**:
- Phase `night_wolves`: Interface de vote + chat privé
- Autres phases: Interface normale (mais connaissent les autres loups)

**Données backend**:
- `role`: "werewolf"
- `canActDuringNight`: true
- `getNightPhase()`: "night_wolves"

### 4.2. Voyante (Seer) 🔮

**Équipe**: Villageois
**Phase de nuit**: `night_seer`
**Pouvoir**: Découvre le rôle d'un joueur chaque nuit

**Mécaniques**:
- Sélectionne un joueur
- Découvre son rôle (werewolf, villager, etc.)
- L'information reste privée (visible seulement à la voyante)

**Victoire**: Avec les villageois

**Affichage pour la voyante**:
- Phase `night_seer`: Interface de sélection + révélation immédiate
- Historique: Liste des rôles découverts (à implémenter si souhaité)

**Données backend**:
- `role`: "seer"
- `canActDuringNight`: true
- `getNightPhase()`: "night_seer"

### 4.3. Sorcière (Witch) 🧙‍♀️

**Équipe**: Villageois
**Phase de nuit**: `night_witch`
**Pouvoir**: 2 potions (une de vie, une de mort)

**Mécaniques**:
- **Potion de vie**: Sauve la victime des loups (1 seule fois)
- **Potion de mort**: Tue un joueur (1 seule fois)
- Voit la cible des loups AVANT de décider
- Peut utiliser les deux potions dans la même nuit
- Peut passer (ne rien faire)

**Victoire**: Avec les villageois

**Affichage pour la sorcière**:
- Phase `night_witch`: 
  - Affichage de la victime des loups
  - Boutons pour utiliser les potions
  - État des potions (disponibles/utilisées)
  - Sélection de cible pour potion de mort

**Données backend**:
- `role`: "witch"
- `metadata.heal_potion`: true/false
- `metadata.kill_potion`: true/false
- `canActDuringNight`: true
- `getNightPhase()`: "night_witch"

### 4.4. Garde (Guard) 🛡️

**Équipe**: Villageois
**Phase de nuit**: `night_guard`
**Pouvoir**: Protège un joueur des loups chaque nuit

**Mécaniques**:
- Sélectionne un joueur à protéger
- Le joueur protégé ne peut pas être tué par les loups
- Ne peut pas protéger le même joueur deux nuits consécutives
- Ne peut pas se protéger lui-même

**Victoire**: Avec les villageois

**Affichage pour le garde**:
- Phase `night_guard`:
  - Liste des joueurs (sauf lui-même)
  - Indication du dernier joueur protégé
  - Sélection de la nouvelle protection

**Données backend**:
- `role`: "guard"
- `metadata.last_protected_id`: ID du dernier joueur protégé
- `canActDuringNight`: true
- `getNightPhase()`: "night_guard"

### 4.5. Cupidon (Cupid) 💘

**Équipe**: Villageois (mais peut gagner avec les amoureux)
**Phase de nuit**: `night_cupid` (UNIQUEMENT nuit 1)
**Pouvoir**: Lie deux joueurs en amoureux

**Mécaniques**:
- Agit SEULEMENT la première nuit (day_number = 1)
- Sélectionne 2 joueurs
- Les deux joueurs deviennent amoureux
- Si un amoureux meurt, l'autre meurt aussi (de chagrin)
- Les amoureux gagnent s'ils sont les deux derniers vivants

**Victoire**: 
- Avec les villageois (normalement)
- Avec les amoureux (si les deux derniers vivants)

**Affichage pour Cupidon**:
- Phase `night_cupid` (nuit 1 uniquement):
  - Interface de sélection de 2 joueurs
  - Confirmation de la sélection

**Données backend**:
- `role`: "cupid"
- `canActDuringNight()`: true (seulement si day_number === 1)
- `getNightPhase()`: "night_cupid"
- Pour les amoureux: `is_lover`: true, `lover_id`: ID de l'amoureux

### 4.6. Chasseur (Hunter) 🏹

**Équipe**: Villageois
**Phase de nuit**: Aucune (agit seulement en mourant)
**Pouvoir**: Tuer un joueur quand il meurt

**Mécaniques**:
- Agit SEULEMENT quand il meurt (nuit ou jour)
- Peut tuer un joueur avant de mourir
- Peut choisir de ne pas tirer
- Si mort la nuit → Phase `hunter_action`
- Si mort par vote → Phase `hunter_day_action` ou pendant `day_execution`

**Victoire**: Avec les villageois

**Affichage pour le chasseur**:
- Phase `hunter_action` / `hunter_day_action`:
  - Message: "Vous êtes mort. Vous pouvez tuer un joueur"
  - Liste des joueurs vivants
  - Sélection + confirmation

**Données backend**:
- `role`: "hunter"
- `canActDuringNight`: false
- `game.state.hunter_can_shoot`: true (si chasseur mort)
- `game.state.hunter_player_id`: ID du chasseur mort

### 4.7. Ancien (Elder) 👴

**Équipe**: Villageois
**Phase de nuit**: Aucune
**Pouvoir**: Résiste à 2 attaques des loups

**Mécaniques**:
- Peut survivre à 1 attaque des loups
- Après 2 attaques, meurt
- Si tué par vote (jour), perd son pouvoir (meurt immédiatement)

**Victoire**: Avec les villageois

**Affichage**: Aucune phase spéciale (comme villageois)

**Données backend**:
- `role`: "elder"
- `metadata.attack_count`: Nombre d'attaques subies (0, 1, ou 2)

### 4.8. Fou (Fool) 🃏

**Équipe**: Villageois (mais objectif différent)
**Phase de nuit**: Aucune
**Pouvoir**: Gagne s'il est éliminé par vote

**Mécaniques**:
- Pense être la voyante (affichage: "Vous êtes la Voyante")
- Mais découvre les rôles au hasard (ou pas du tout)
- Si éliminé par vote (jour), gagne la partie seul
- Si tué par les loups, perd (comme les autres)

**Victoire**: Être éliminé par vote (jour)

**Affichage**: 
- Affiché comme "Voyante" au début
- Phase `night_seer`: Peut "révéler" (mais résultat faux ou aléatoire)
- Révélation du vrai rôle seulement à la fin

**Données backend**:
- `role`: "fool"
- `game.state.fool_eliminated`: true (si éliminé par vote)
- `canActDuringNight`: true (seulement pour l'interface)

### 4.9. Villageois (Villager) 👨‍🌾

**Équipe**: Villageois
**Phase de nuit**: Aucune
**Pouvoir**: Aucun

**Mécaniques**:
- Pas de pouvoir spécial
- Vote pendant le jour
- Participe au débat

**Victoire**: Avec les villageois

**Affichage**: Interface normale (jour uniquement)

**Données backend**:
- `role`: "villager"
- `canActDuringNight`: false

---

## 5. PHASES DU JEU - DÉTAILS EXHAUSTIFS {#phases-du-jeu}

### Liste complète des phases

1. `lobby`: Lobby (avant le début)
2. `role_reveal`: Révélation des rôles (15s)
3. `night_cupid`: Phase Cupidon (20s, nuit 1 uniquement)
4. `night_wolves`: Phase des loups (30s)
5. `night_guard`: Phase du garde (20s)
6. `night_witch`: Phase de la sorcière (25s)
7. `night_seer`: Phase de la voyante (15s)
8. `night_processing`: Processing de nuit (3s)
9. `hunter_action`: Action du chasseur (nuit, 20s, conditionnel)
10. `day_reveal`: Révélation des morts (10s)
11. `day_debate`: Débat (180s)
12. `day_vote`: Vote (30s)
13. `day_vote_result`: Résultat du vote (5s)
14. `day_last_words`: Derniers mots (10s)
15. `day_execution`: Exécution (15s)
16. `hunter_day_action`: Action du chasseur (jour, 20s, conditionnel)
17. `game_end`: Fin de partie

### Flow des transitions

```
lobby
  ↓ (démarrage)
role_reveal
  ↓ (tous confirmés)
night_cupid (si nuit 1)
  ↓
night_wolves (ou skip si pas de loups)
  ↓
night_guard (ou skip si garde mort)
  ↓
night_witch (ou skip si sorcière morte)
  ↓
night_seer (ou skip si voyante morte)
  ↓
night_processing
  ↓
[hunter_action] (si chasseur mort) OU
day_reveal
  ↓
day_debate
  ↓
day_vote
  ↓
day_vote_result
  ↓ (si élimination)
day_last_words
  ↓
day_execution
  ↓ (si chasseur éliminé)
[hunter_day_action] OU
  ↓
Vérification victoire → game_end OU
Nuit suivante (night_wolves ou night_cupid si jour 1)
```

### Durées des phases

| Phase | Durée | Type |
|-------|-------|------|
| `lobby` | ∞ | Manuel |
| `role_reveal` | 15s | Auto/Tous confirmés |
| `night_cupid` | 20s | Auto/Action soumise |
| `night_wolves` | 30s | Auto/Action soumise |
| `night_guard` | 20s | Auto/Action soumise |
| `night_witch` | 25s | Auto/Action soumise |
| `night_seer` | 15s | Auto/Action soumise |
| `night_processing` | 3s | Auto |
| `hunter_action` | 20s | Auto/Action soumise |
| `day_reveal` | 10s | Auto |
| `day_debate` | 180s (20s test) | Auto |
| `day_vote` | 30s | Auto/Tous ont voté |
| `day_vote_result` | 5s | Auto |
| `day_last_words` | 10s | Auto |
| `day_execution` | 15s | Auto |
| `hunter_day_action` | 20s | Auto/Action soumise |
| `game_end` | ∞ | Manuel |

### Phases conditionnelles

**Phases skippées automatiquement**:
- `night_cupid`: Si pas nuit 1 ou Cupidon mort
- `night_wolves`: Si aucun loup vivant (NE JAMAIS SKIP sinon)
- `night_guard`: Si garde mort
- `night_witch`: Si sorcière morte
- `night_seer`: Si voyante morte
- `hunter_action`: Si pas de chasseur mort la nuit
- `hunter_day_action`: Si pas de chasseur éliminé par vote
- `day_last_words`: Si pas d'élimination (vote blanc/égalité)

---

## 6. API BACKEND - DOCUMENTATION COMPLÈTE {#api-backend}

### Base URL
`/api`

### Authentification
Toutes les routes (sauf auth) nécessitent:
- Header: `Authorization: Bearer {token}`
- Token obtenu via `/api/auth/firebase`

### Routes d'authentification

#### POST /api/auth/firebase
**Description**: Authentification Firebase

**Body**:
```json
{
  "token": "firebase_id_token"
}
```

**Réponse**:
```json
{
  "user": {
    "id": 1,
    "name": "Nom",
    "email": "email@example.com"
  },
  "token": "sanctum_token"
}
```

### Routes de jeu

#### POST /api/games
**Description**: Créer une partie

**Body**:
```json
{
  "player_count": 8  // 6-18
}
```

**Réponse**:
```json
{
  "success": true,
  "game": {
    "id": 1,
    "code": "ABC12",
    "status": "lobby",
    "phase": "lobby",
    "config": {
      "host_id": 1,
      "player_count": 8
    },
    "players": [...]
  },
  "code": "ABC12"
}
```

#### POST /api/games/{code}/join
**Description**: Rejoindre une partie

**Réponse**:
```json
{
  "success": true,
  "game": { ... }
}
```

#### GET /api/games/{game}
**Description**: Récupérer l'état d'une partie

**Réponse**:
```json
{
  "id": 1,
  "code": "ABC12",
  "status": "night",
  "phase": "night_wolves",
  "day_number": 1,
  "config": { ... },
  "state": {
    "wolves_target_id": 3,
    "night_deaths": [...]
  },
  "phase_ends_at": "2024-01-01T12:00:00Z",
  "players": [
    {
      "id": 1,
      "user_id": 1,
      "role": "werewolf",
      "is_alive": true,
      "is_protected": false,
      "is_lover": false,
      "metadata": {},
      "user": {
        "id": 1,
        "name": "Joueur"
      }
    }
  ]
}
```

#### POST /api/games/{game}/start
**Description**: Démarrer la partie (hôte uniquement)

**Réponse**:
```json
{
  "success": true,
  "message": "La partie a commencé",
  "game": { ... }
}
```

#### POST /api/games/{game}/ready
**Description**: Basculer l'état ready

**Réponse**:
```json
{
  "success": true,
  "is_ready": true,
  "game": { ... }
}
```

#### POST /api/games/{game}/leave
**Description**: Quitter la partie

**Réponse**:
```json
{
  "success": true,
  "message": "Vous avez quitté la partie",
  "game": { ... }
}
```

#### POST /api/games/{game}/transfer-host
**Description**: Transférer le rôle d'hôte

**Body**:
```json
{
  "user_id": 2
}
```

#### POST /api/games/{game}/kick-player
**Description**: Exclure un joueur (hôte uniquement)

**Body**:
```json
{
  "user_id": 2
}
```

#### POST /api/games/{game}/confirm-role-reveal
**Description**: Confirmer la révélation du rôle

**Réponse**:
```json
{
  "success": true,
  "all_confirmed": false,
  "game": { ... },
  "message": "Confirmation enregistrée..."
}
```

#### POST /api/games/{game}/actions
**Description**: Soumettre une action

**Body** (exemples):
- Vote loup: `{"type": "kill_vote", "target_id": 3}`
- Protection garde: `{"type": "protect", "target_id": 4}`
- Sorcière: `{"type": "witch_potion", "target_id": 5, "data": {"potion_type": "kill"}}`
- Voyante: `{"type": "reveal_role", "target_id": 6}`
- Cupidon: `{"type": "cupid_match", "data": {"player1_id": 1, "player2_id": 2}}`
- Vote jour: `{"type": "day_vote", "target_id": 7}`
- Chasseur: `{"type": "hunter_shoot", "target_id": 8}`

**Réponse**:
```json
{
  "success": true,
  "action": { ... }
}
```

**Réponse spéciale (voyante)**:
```json
{
  "success": true,
  "action": { ... },
  "revealed_role": "werewolf",
  "target_player_id": 6,
  "target_player_name": "Joueur X"
}
```

#### GET /api/games/{game}/actions
**Description**: Récupérer les actions possibles pour la phase actuelle

**Réponse**:
```json
{
  "success": true,
  "actions": [
    {
      "type": "kill_vote",
      "description": "Votez pour une victime",
      "target_type": "player",
      "target_filter": "alive_except_self"
    }
  ],
  "phase": "night_wolves"
}
```

#### GET /api/games/{game}/night-events
**Description**: Récupérer les événements de la nuit (pour recap)

**Réponse**:
```json
{
  "success": true,
  "events": [
    {
      "type": "wolf_kill",
      "description": "🐺 Les loups ont choisi de dévorer Joueur X",
      "target": "Joueur X",
      "private": true
    }
  ],
  "round": 1
}
```

#### POST /api/games/{game}/check-expired-phase
**Description**: Vérifier et avancer une phase expirée (pour tests)

**Réponse**:
```json
{
  "success": true,
  "expired": true,
  "advanced": true,
  "new_phase": "day_reveal",
  "game": { ... }
}
```

### Routes de chat

#### POST /api/games/{game}/messages
**Description**: Envoyer un message

**Body**:
```json
{
  "content": "Message",
  "channel": "global"  // "global", "wolves", "dead", "lobby"
}
```

#### GET /api/games/{game}/messages/{channel}
**Description**: Récupérer les messages d'un channel

**Réponse**:
```json
{
  "messages": [
    {
      "id": 1,
      "user_id": 1,
      "content": "Message",
      "channel": "global",
      "user": {
        "id": 1,
        "name": "Joueur"
      },
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Événements WebSocket (Laravel Echo)

**Channel**: `private-game.{game_id}.state`

#### .GameUpdated
**Description**: Mise à jour de la partie

**Données**:
```json
{
  "game": {
    // Objet Game complet avec relations
  }
}
```

#### .PhaseChanged
**Description**: Changement de phase

**Données**:
```json
{
  "phase": "night_wolves",
  "game": {
    // Objet Game complet
  }
}
```

#### .PlayerKilled
**Description**: Un joueur a été tué

**Données**:
```json
{
  "player_id": 3,
  "game_id": 1
}
```

#### .GameDeleted
**Description**: La partie a été supprimée

**Données**:
```json
{
  "game_id": 1
}
```

**Channel chat**: `private-game.{game_id}.chat.{channel}` (global, wolves, dead, lobby)

#### .MessageSent
**Description**: Nouveau message

**Données**:
```json
{
  "message": {
    "id": 1,
    "user_id": 1,
    "content": "Message",
    "channel": "global",
    "user": { ... },
    "created_at": "..."
  }
}
```

---

## 7. STRUCTURE DES DONNÉES {#structure-des-données}

### Objet Game

```typescript
interface Game {
  id: number;
  code: string;                    // 5 caractères
  status: 'lobby' | 'night' | 'day' | 'voting' | 'ended';
  phase: string;                   // Phase actuelle
  day_number: number;              // Numéro du jour (1 = première nuit)
  config: {
    host_id: number;
    player_count: number;
    is_test?: boolean;
  };
  state: {
    // Données temporaires
    wolves_target_id?: number;
    wolves_target_name?: string;
    night_deaths?: Array<{
      player_id: number;
      cause: string;
    }>;
    vote_result?: {
      target_id: number;
      votes: number;
    };
    executed_player_id?: number;
    hunter_can_shoot?: boolean;
    hunter_player_id?: number;
    hunter_target_id?: number;
    winner?: 'werewolves' | 'villagers' | 'lovers';
    // ... autres données temporaires
  };
  phase_ends_at: string | null;    // ISO datetime
  players: GamePlayer[];
  created_at: string;
  updated_at: string;
}
```

### Objet GamePlayer

```typescript
interface GamePlayer {
  id: number;
  game_id: number;
  user_id: number;
  role: 'werewolf' | 'seer' | 'witch' | 'guard' | 'cupid' | 'hunter' | 'elder' | 'fool' | 'villager';
  is_alive: boolean;
  is_protected: boolean;
  is_lover: boolean;
  lover_id: number | null;
  metadata: {
    is_ready?: boolean;
    role_revealed?: boolean;
    heal_potion?: boolean;         // Sorcière
    kill_potion?: boolean;         // Sorcière
    last_protected_id?: number;    // Garde
    attack_count?: number;         // Ancien
    // ... autres métadonnées
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  is_host?: boolean;               // Accessor
}
```

### Objet Action

```typescript
interface Action {
  id: number;
  game_id: number;
  round: number;                   // day_number
  type: 'cupid_match' | 'protect' | 'kill_vote' | 'witch_potion' | 'reveal_role' | 'day_vote' | 'hunter_shoot';
  player_id: number;
  target_id: number | null;
  data: Record<string, any>;       // Données additionnelles
  processed: boolean;
  player?: GamePlayer;
  target?: GamePlayer;
}
```

### Objet Message

```typescript
interface Message {
  id: number;
  game_id: number;
  user_id: number;
  channel: 'global' | 'wolves' | 'dead' | 'lobby';
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}
```

---

## 8. DESIGN SYSTEM - GRIMM FOLKLORE {#design-system}

### Palette de couleurs

**Fonds**:
- `--grimm-bg-charcoal`: `#121212` (Fond principal)
- `--grimm-bg-night`: `#0A0E27` (Fond nuit)
- `--grimm-bg-night-light`: `#1A1F3A` (Fond nuit clair)

**Accents - Or (Village)**:
- `--grimm-gold-dark`: `#B8860B`
- `--grimm-gold-light`: `#DAA520`

**Accents - Rouge (Loups)**:
- `--grimm-red-dark`: `#8B0000`
- `--grimm-red-light`: `#DC143C`

**Accents - Violet (Voyante)**:
- `--grimm-purple-dark`: `#4B0082`
- `--grimm-purple-light`: `#9370DB`

**Accents - Sépia (Jour)**:
- `--grimm-sepia-dark`: `#D2B48C`
- `--grimm-sepia-light`: `#F4A460`

**Texte**:
- `--grimm-text-primary`: `#E5E5E5`
- `--grimm-text-secondary`: `#B0B0B0`
- `--grimm-text-muted`: `#808080`

**États**:
- `--grimm-success`: `#2ECC71`
- `--grimm-warning`: `#F39C12`
- `--grimm-error`: `#DC143C`
- `--grimm-info`: `#3498DB`

### Typographie

**Polices**:
- **Display**: `Cinzel`, serif (titres principaux)
- **UI**: `Inter`, sans-serif (texte général)
- **Décorative**: Emojis pour les rôles

**Tailles** (à définir selon design):
- `text-4xl`, `text-5xl`: Titres principaux
- `text-2xl`, `text-xl`: Sous-titres
- `text-lg`, `text-base`: Corps de texte
- `text-sm`: Textes secondaires

### Espacements

- `--grimm-spacing-xs`: `0.25rem`
- `--grimm-spacing-sm`: `0.5rem`
- `--grimm-spacing-md`: `1rem`
- `--grimm-spacing-lg`: `1.5rem`
- `--grimm-spacing-xl`: `2rem`
- `--grimm-spacing-2xl`: `3rem`

### Bordures

- `--grimm-border-radius`: `8px`
- `--grimm-border-radius-lg`: `12px`
- `--grimm-border-width`: `2px`

### Ombres et lueurs

- `--grimm-shadow-sm`: `0 2px 4px rgba(0, 0, 0, 0.3)`
- `--grimm-shadow-md`: `0 4px 8px rgba(0, 0, 0, 0.4)`
- `--grimm-shadow-lg`: `0 8px 16px rgba(0, 0, 0, 0.5)`
- `--grimm-glow-gold`: `0 0 20px rgba(184, 134, 11, 0.5)`
- `--grimm-glow-red`: `0 0 20px rgba(139, 0, 0, 0.5)`
- `--grimm-glow-purple`: `0 0 20px rgba(75, 0, 130, 0.5)`

### Transitions

- `--grimm-transition-fast`: `0.15s ease-out`
- `--grimm-transition-base`: `0.3s ease-out`
- `--grimm-transition-slow`: `0.5s ease-out`
- `--grimm-transition-card`: `1.5s cubic-bezier(0.4, 0, 0.2, 1)`

### Texture

**Parchemin vieilli** (définie dans `--grimm-parchment-texture`):
- Gradients linéaires répétés
- Gradients radiaux pour profondeur
- Effet vieilli subtil

### Classes utilitaires

**Glassmorphism**:
- `.glassmorphism-dark`: Fond semi-transparent sombre avec flou

**Bordures**:
- `.border-irregular`: Bordure irrégulière (si texture)

**Textes**:
- `.text-glow-gold`: Texte avec lueur or
- `.text-cinzel`: Police Cinzel
- `.text-ui`: Police Inter

### Composants UI standards

**ActionButton**:
- Variants: `primary`, `secondary`
- Prop `glow`: Boolean (lueur activée)
- Styles selon variant

**PlayerCard**:
- Affichage du joueur
- États: `is-dead`, `is-host`, `is-selected`
- Avatar/Initiale

**ChatBox**:
- Zone de chat
- Channel sélectionné
- Envoi de messages

---

## 9. FLOW DE REFONTE DU DESIGN {#flow-de-refonte}

### Objectifs de la refonte

1. **Cohérence visuelle**: Design system unifié "Grimm Folklore"
2. **Expérience utilisateur**: Navigation intuitive, feedback clair
3. **Performance**: Transitions fluides, animations subtiles
4. **Accessibilité**: Contrastes, tailles de texte, navigation clavier
5. **Responsive**: Adaptation mobile/tablette/desktop

### Étapes de travail

#### Étape 1: Audit du design actuel

**À faire**:
1. Lister tous les composants existants
2. Identifier les incohérences
3. Documenter les patterns existants
4. Identifier les éléments à garder/modifier/supprimer

**Fichiers à examiner**:
- `resources/css/*.css`
- `resources/js/components/**/*.vue`
- `resources/js/views/**/*.vue`

#### Étape 2: Définition du design system

**À créer/modifier**:
1. **Variables CSS** (`resources/css/grimm-variables.css`):
   - Compléter la palette
   - Ajouter les tailles de police
   - Définir les espacements
   - Définir les animations

2. **Classes utilitaires** (`resources/css/app.css`):
   - Glassmorphism
   - Bordures
   - Ombres
   - Transitions

3. **Composants de base**:
   - ActionButton (améliorer)
   - PlayerCard (refonte si nécessaire)
   - Modal/Dialog
   - Input/Textarea
   - Badge
   - Timer

#### Étape 3: Refonte des pages principales

**Ordre de travail**:

1. **HomeView** (`resources/js/views/HomeView.vue`)
   - Page d'accueil
   - Authentification
   - Modal création partie

2. **LobbyView** (`resources/js/views/LobbyView.vue`)
   - Header avec code
   - Grille de joueurs
   - Chat
   - Footer avec actions

3. **GameView** (`resources/js/views/GameView.vue`)
   - Router vers composants de phase
   - Chat global
   - Layout commun

#### Étape 4: Refonte des composants de phase

**Ordre de travail** (selon flow du jeu):

1. **RoleReveal** (`resources/js/components/Game/RoleReveal.vue`)
   - Révélation du rôle
   - Animation de carte

2. **Phases de nuit**:
   - `NightStart.vue`: Écran de transition
   - `CupidPhase.vue`: Sélection 2 joueurs
   - `NightPhase.vue`: Phase des loups (avec chat)
   - `GuardPhase.vue`: Sélection protection
   - `WitchPhase.vue`: Interface potions
   - `SeerPhase.vue`: Sélection + révélation
   - `NightSleep.vue` / `NightProcessing.vue`: Processing
   - `HunterAction.vue`: Action chasseur
   - `NightEnd.vue`: Fin de nuit

3. **Phases de jour**:
   - `DayStart.vue` / `DayReveal.vue`: Révélation morts
   - `DayPhase.vue`: Débat + Vote
   - `VoteResult.vue`: Résultat vote
   - `DayLastWords.vue`: Derniers mots
   - `DayExecution.vue`: Exécution
   - `HunterDayAction.vue`: Action chasseur jour

4. **GameEnd** (`resources/js/components/Game/GameEnd.vue`)
   - Écran de fin
   - Révélation des rôles
   - Équipe gagnante

#### Étape 5: Composants UI réutilisables

**À créer/améliorer**:

1. **ActionButton** (`resources/js/components/UI/ActionButton.vue`)
   - Variants
   - États (disabled, loading)
   - Animations

2. **PlayerCard** (`resources/js/components/Player/PlayerCard.vue`)
   - Affichage joueur
   - États visuels
   - Interactions

3. **ChatBox** (`resources/js/components/Chat/ChatBox.vue`)
   - Interface de chat
   - Channels
   - Envoi messages

4. **ChatBubble** (`resources/js/components/Chat/ChatBubble.vue`)
   - Bulle de message
   - Avatar
   - Timestamp

5. **Timer** (`resources/js/components/UI/Timer.vue`)
   - Compte à rebours
   - Affichage visuel
   - Animations

6. **Modal** (`resources/js/components/UI/Modal.vue`)
   - Overlay
   - Contenu
   - Animations

7. **PlayerList** (`resources/js/components/Game/PlayerList.vue`)
   - Liste de joueurs
   - Sélection
   - Filtres

#### Étape 6: Animations et transitions

**À créer/modifier** (`resources/css/animations.css`):

1. **Transitions de phase**:
   - Fade in/out
   - Slide up/down
   - Scale in/out

2. **Animations de cartes**:
   - Flip (révélation rôle)
   - Hover
   - Selection

3. **Animations de feedback**:
   - Notification
   - Action confirmée
   - Erreur

4. **Animations de mort**:
   - Révélation morts
   - Exécution
   - Transition jour/nuit

#### Étape 7: Responsive design

**À créer/modifier** (`resources/css/responsive.css`):

1. **Breakpoints**:
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: > 1024px

2. **Adaptations**:
   - Grilles de joueurs
   - Chat
   - Modals
   - Navigation

#### Étape 8: Tests et ajustements

**À faire**:
1. Tester toutes les phases
2. Tester tous les rôles
3. Vérifier les transitions
4. Vérifier le responsive
5. Corriger les bugs visuels

---

## 10. FICHIERS À MODIFIER/CRÉER {#fichiers-à-modifier}

### Fichiers CSS

#### À modifier
- `resources/css/grimm-variables.css`: Variables CSS (compléter)
- `resources/css/app.css`: Styles globaux, classes utilitaires
- `resources/css/animations.css`: Animations et transitions

#### À créer (si nécessaire)
- `resources/css/components.css`: Styles des composants
- `resources/css/responsive.css`: Media queries responsive

### Fichiers Vue - Views

#### À modifier
- `resources/js/views/HomeView.vue`: Page d'accueil
- `resources/js/views/LobbyView.vue`: Lobby
- `resources/js/views/GameView.vue`: Vue principale du jeu

### Fichiers Vue - Components Game

#### À modifier/créer
- `resources/js/components/Game/RoleReveal.vue`: Révélation rôle
- `resources/js/components/Game/NightStart.vue`: Début nuit
- `resources/js/components/Game/CupidPhase.vue`: Phase Cupidon
- `resources/js/components/Game/NightPhase.vue`: Phase loups
- `resources/js/components/Game/GuardPhase.vue`: Phase garde
- `resources/js/components/Game/WitchPhase.vue`: Phase sorcière
- `resources/js/components/Game/SeerPhase.vue`: Phase voyante
- `resources/js/components/Game/NightSleep.vue`: Sleep nuit
- `resources/js/components/Game/NightProcessing.vue`: Processing nuit
- `resources/js/components/Game/NightEnd.vue`: Fin nuit
- `resources/js/components/Game/HunterAction.vue`: Action chasseur nuit
- `resources/js/components/Game/DayStart.vue`: Début jour
- `resources/js/components/Game/DayReveal.vue`: Révélation morts
- `resources/js/components/Game/DayPhase.vue`: Débat + Vote
- `resources/js/components/Game/VoteResult.vue`: Résultat vote
- `resources/js/components/Game/DayLastWords.vue`: Derniers mots
- `resources/js/components/Game/DayExecution.vue`: Exécution
- `resources/js/components/Game/HunterDayAction.vue`: Action chasseur jour
- `resources/js/components/Game/GameEnd.vue`: Fin partie

### Fichiers Vue - Components UI

#### À modifier/créer
- `resources/js/components/UI/ActionButton.vue`: Bouton d'action
- `resources/js/components/UI/Timer.vue`: Compte à rebours
- `resources/js/components/UI/Modal.vue`: Modal/Dialog
- `resources/js/components/UI/PlayerList.vue`: Liste de joueurs (si nécessaire)

### Fichiers Vue - Components Player

#### À modifier
- `resources/js/components/Player/PlayerCard.vue`: Carte joueur

### Fichiers Vue - Components Chat

#### À modifier
- `resources/js/components/Chat/ChatBox.vue`: Boîte de chat
- `resources/js/components/Chat/ChatBubble.vue`: Bulle de message

### Assets (Images)

#### À créer (si nécessaire)
- `public/images/roles/*.webp`: Images des rôles
  - `loup.webp`
  - `voyante.webp`
  - `sorcière.webp`
  - `garde.webp`
  - `cupidon.webp`
  - `chasseur.webp`
  - `ancien.webp`
  - `fou.webp`
  - `villageois.webp`

---

## 11. INSTRUCTIONS DE TRAVAIL {#instructions-de-travail}

### Connexion au backend

**Important**: Le backend est déjà fonctionnel. Votre travail est uniquement sur le **frontend**.

**Points de connexion**:
1. **API REST**: Toutes les routes `/api/*` (déjà configurées)
2. **WebSocket**: Laravel Echo (déjà configuré dans `resources/js/bootstrap.js`)
3. **Store Pinia**: `gameStore` et `authStore` (déjà configurés)

### Workflow recommandé

#### 1. Comprendre la structure existante

**À lire en premier**:
- `resources/js/stores/gameStore.js`: Comprendre le state management
- `resources/js/views/GameView.vue`: Comprendre le routing des phases
- `routes/api.php`: Comprendre les endpoints disponibles

#### 2. Tester l'application actuelle

**Commandes**:
```bash
# Installer les dépendances (si nécessaire)
npm install

# Lancer le serveur de développement
npm run dev

# Backend Laravel (dans un autre terminal)
php artisan serve
```

**Test**:
1. Créer une partie de test
2. Naviguer dans les différentes phases
3. Identifier les éléments à améliorer

#### 3. Prioriser les modifications

**Ordre recommandé**:
1. **Design System** (variables CSS, classes utilitaires)
2. **Composants UI de base** (ActionButton, PlayerCard, etc.)
3. **Pages principales** (HomeView, LobbyView, GameView)
4. **Composants de phase** (un par un, dans l'ordre du flow)
5. **Animations** (ajouter progressivement)
6. **Responsive** (adapter aux différentes tailles)

#### 4. Respecter le backend

**Important**: 
- Ne PAS modifier la structure des données renvoyées par le backend
- Utiliser les données telles qu'elles sont (Game, GamePlayer, etc.)
- Respecter les types d'actions (voir section API)
- Respecter les phases (voir section Phases)

**Exemple**:
```javascript
// ✅ CORRECT: Utiliser les données du backend
const player = gameStore.currentPlayer;
const role = player.role; // "werewolf", "seer", etc.

// ❌ INCORRECT: Modifier la structure
player.customField = "value"; // Ne pas faire ça
```

#### 5. Gérer les états

**États à gérer**:
- **Loading**: Chargement des données
- **Error**: Erreurs API
- **Success**: Actions réussies
- **Empty**: États vides (pas de joueurs, etc.)

**Exemple**:
```vue
<template>
  <div v-if="loading">Chargement...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>
    <!-- Contenu -->
  </div>
</template>
```

#### 6. Gérer les événements WebSocket

**Événements à écouter** (déjà configurés dans GameView.vue):
- `.GameUpdated`: Mise à jour de la partie
- `.PhaseChanged`: Changement de phase
- `.PlayerKilled`: Mort d'un joueur
- `.GameDeleted`: Suppression de la partie

**Exemple** (déjà dans GameView.vue):
```javascript
window.Echo.private(`game.${gameId}.state`)
  .listen('.GameUpdated', (e) => {
    gameStore.setGame(e);
  })
  .listen('.PhaseChanged', (e) => {
    gameStore.setGame(e);
    gameStore.phase = e.phase;
  });
```

#### 7. Feedback utilisateur

**À implémenter**:
- **Notifications**: Pour les actions réussies/échecs
- **Loading states**: Pour les actions en cours
- **Validation**: Vérifier les inputs avant envoi
- **Confirmations**: Pour les actions importantes

**Exemple**:
```javascript
// Notification (déjà disponible via window.showNotification)
window.showNotification('Action enregistrée', 'success');

// Loading state
const loading = ref(false);
const handleAction = async () => {
  loading.value = true;
  try {
    await submitAction();
    window.showNotification('Succès', 'success');
  } catch (error) {
    window.showNotification('Erreur', 'error');
  } finally {
    loading.value = false;
  }
};
```

#### 8. Accessibilité

**À respecter**:
- **Contrastes**: Texte lisible (ratio 4.5:1 minimum)
- **Tailles**: Textes cliquables (min 44x44px)
- **Navigation clavier**: Tab, Enter, Escape
- **Aria labels**: Pour les éléments interactifs
- **Focus visible**: Indicateur de focus clair

#### 9. Performance

**Optimisations**:
- **Lazy loading**: Charger les composants à la demande
- **Memoization**: Utiliser `computed` pour les calculs
- **Debounce**: Pour les inputs (si nécessaire)
- **Images**: Optimiser les images (WebP, taille réduite)

#### 10. Tests visuels

**À tester**:
- Tous les rôles (créer des parties de test)
- Toutes les phases (suivre un flow complet)
- Toutes les actions (voter, protéger, etc.)
- Transitions entre phases
- Responsive (mobile, tablette, desktop)
- États d'erreur (réseau, permissions, etc.)

### Checklist de livraison

**Avant de livrer**:
- [ ] Tous les composants sont stylisés
- [ ] Toutes les phases sont fonctionnelles
- [ ] Les animations sont fluides
- [ ] Le responsive fonctionne
- [ ] Les notifications sont implémentées
- [ ] Les erreurs sont gérées
- [ ] Le code est propre et commenté
- [ ] Les variables CSS sont utilisées
- [ ] Les composants sont réutilisables
- [ ] Les performances sont bonnes

### Ressources utiles

**Documentation**:
- Vue 3: https://vuejs.org/
- Pinia: https://pinia.vuejs.org/
- Laravel Echo: https://laravel.com/docs/broadcasting
- CSS Variables: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

**Outils**:
- Vue DevTools (extension navigateur)
- Laravel Telescope (si disponible)
- Network tab (pour déboguer les API)

---

## 📝 NOTES FINALES

### Contact avec le backend

Si vous avez des questions sur le backend ou besoin de modifications:
- **Ne PAS modifier le code backend** sans coordination
- **Documenter** les besoins de données supplémentaires
- **Tester** avec les données actuelles du backend

### Évolutions possibles

**Améliorations futures** (hors scope actuel):
- Historique des actions (voyante, etc.)
- Statistiques de partie
- Thèmes personnalisables
- Animations avancées
- Mode spectateur

### Support

En cas de problème:
1. Vérifier la console (erreurs JavaScript)
2. Vérifier le Network tab (erreurs API)
3. Vérifier les logs Laravel (si accessible)
4. Documenter le problème avec captures d'écran

---

**Bon courage pour la refonte ! 🎨✨**
