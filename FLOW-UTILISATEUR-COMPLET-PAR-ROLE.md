# 📱 FLOW UTILISATEUR COMPLET - PAR RÔLE
## Loup-Garou - Grimm Folklore Edition

---

## 📋 TABLE DES MATIÈRES

1. [Flow général](#flow-général)
2. [Loup-Garou (Werewolf)](#loup-garou)
3. [Voyante (Seer)](#voyante)
4. [Sorcière (Witch)](#sorcière)
5. [Garde (Guard)](#garde)
6. [Cupidon (Cupid)](#cupidon)
7. [Chasseur (Hunter)](#chasseur)
8. [Ancien (Elder)](#ancien)
9. [Fou (Fool)](#fou)
10. [Villageois (Villager)](#villageois)
11. [Morts (Dead Players)](#morts)

---

## 1. FLOW GÉNÉRAL {#flow-général}

### Tous les joueurs (quel que soit le rôle)

#### 1.1. Authentification et Accueil

**Page**: `HomeView.vue`

**Écran**:
```
┌─────────────────────────────────┐
│      LOUP-GAROU                 │
│   GRIMM FOLKLORE                │
│                                 │
│   [CONNECT IDENTITY]            │
└─────────────────────────────────┘
```

**Actions**:
- Cliquer sur "CONNECT IDENTITY" → Firebase Auth (Google)
- Après connexion → Affiche avatar + nom + "ACCESS GRANTED"

**États**:
- Non connecté: Bouton "CONNECT IDENTITY"
- Connecté: Avatar, nom, boutons "INITIATE GAME", "JOIN", "DÉCONNEXION"

#### 1.2. Création/Rejoindre Partie

**Page**: `HomeView.vue`

**Actions**:
- **Créer partie**: 
  - Cliquer "INITIATE GAME" → Modal
  - Sélectionner nombre de joueurs (8/10/12)
  - Cliquer "CRÉER" → Redirection vers Lobby
- **Rejoindre partie**:
  - Entrer code dans input
  - Cliquer "JOIN" → Redirection vers Lobby

#### 1.3. Lobby

**Page**: `LobbyView.vue`

**Écran**:
```
┌─────────────────────────────────┐
│ Code: ABC12    [📋] [📱] [🚪]  │
├─────────────────────────────────┤
│                                 │
│  [Joueur 1]  [Joueur 2]  [+]   │
│  [Joueur 3]  [Joueur 4]  [+]   │
│  [+]         [+]         [+]   │
│                                 │
├─────────────────────────────────┤
│ Chat:                           │
│ [Message input]                 │
├─────────────────────────────────┤
│ [CONFIRM READINESS] ou          │
│ [DÉMARRER] (si hôte)            │
└─────────────────────────────────┘
```

**Actions**:
- **Si joueur**: Cliquer "CONFIRM READINESS" → Bascule état ready
- **Si hôte**: Cliquer "DÉMARRER" (actif si tous prêts + min 6 joueurs)
- **Chat**: Envoyer messages dans le lobby
- **Actions hôte**: Copier code, QR code, quitter, transférer hôte, exclure joueur

**Transitions**:
- Quand tous prêts + hôte démarre → `role_reveal`

#### 1.4. Révélation du Rôle

**Phase**: `role_reveal`

**Page**: `GameView.vue` → `RoleReveal.vue`

**Écran** (exemple Loup-Garou):
```
┌─────────────────────────────────┐
│         🌙 LA NUIT TOMBE        │
│                                 │
│         [Carte Rôle]            │
│          🐺 LOUP-GAROU          │
│                                 │
│    Équipe: LOUPS               │
│    Description: ...             │
│                                 │
│      [J'AI VU MON RÔLE]         │
│                                 │
│   3/8 joueurs ont confirmé     │
└─────────────────────────────────┘
```

**Affichage selon le rôle**:
- **Carte du rôle** avec icône/image
- **Nom du rôle**
- **Équipe** (Villageois / Loups)
- **Description** du pouvoir
- **Bouton "J'AI VU MON RÔLE"**

**Actions**:
- Lire son rôle
- Cliquer "J'AI VU MON RÔLE" → Confirmation
- Attendre que tous confirment (ou timer 15s)

**Transitions**:
- Tous confirmés → `night_cupid` (si nuit 1) ou `night_wolves`

---

## 2. LOUP-GAROU (WEREWOLF) 🐺 {#loup-garou}

### Équipe: Loups
### Pouvoir: Vote pour dévorer un villageois chaque nuit

### Flow complet

#### 2.1. Révélation du Rôle

**Phase**: `role_reveal`

**Écran**:
```
┌─────────────────────────────────┐
│         🌙 LA NUIT TOMBE        │
│                                 │
│      [Carte Loup-Garou]         │
│         🐺 LOUP-GAROU           │
│                                 │
│    Équipe: LOUPS                │
│    Description: Chaque nuit,    │
│    votez avec les autres loups  │
│    pour dévorer un villageois   │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

**Affichage**: 
- Carte avec icône loup (🐺)
- Couleur: Rouge (équipe loups)
- Description du pouvoir

#### 2.2. Nuit 1 - Cupidon (Si présent)

**Phase**: `night_cupid`

**Affichage**: Écran sombre (attente)
- Message: "Cupidon agit..." (si Cupidon présent)
- Ou directement skip vers `night_wolves`

**Actions**: Aucune (pas Cupidon)

#### 2.3. Phase des Loups (CHAQUE NUIT)

**Phase**: `night_wolves`

**Écran**:
```
┌─────────────────────────────────┐
│      🌙 PHASE DES LOUPS         │
│                                 │
│   Votez pour une victime        │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4] [Joueur 5] [Joueur6]│
│  [Joueur 7] [Joueur 8]          │
│                                 │
│  Sélectionné: Joueur 3          │
│  [VOTER]                        │
│                                 │
│  ─── Chat Loups ───             │
│  Loup1: Votez pour Joueur 3    │
│  Loup2: OK                      │
│  [Message input]                │
│                                 │
│  Timer: 25s                     │
└─────────────────────────────────┘
```

**Éléments visuels**:
- Écran sombre (nuit)
- Liste des joueurs vivants SAUF les autres loups
- Chat privé "wolves" (visible seulement aux loups)
- Sélection de la cible
- Affichage des votes des autres loups (via chat)
- Timer (30s)

**Actions**:
- Sélectionner un joueur à dévorer
- Cliquer "VOTER" → Soumission
- Chat avec les autres loups (coordination)
- Voir les votes des autres loups (en temps réel)

**Données backend**:
- `role`: "werewolf"
- `canActDuringNight`: true
- `getNightPhase()`: "night_wolves"

**API**:
```javascript
POST /api/games/{game}/actions
{
  "type": "kill_vote",
  "target_id": 3
}
```

**Transitions**:
- Après vote → Attendre autres loups
- Tous ont voté → `night_guard`

#### 2.4. Phases suivantes (Garde, Sorcière, Voyante)

**Affichage**: Écran sombre (attente)
- Message: "Le garde agit..." / "La sorcière agit..." / "La voyante agit..."
- Aucune action

#### 2.5. Processing de Nuit

**Phase**: `night_processing`

**Affichage**: Écran sombre
- Message: "La nuit se termine..."
- Animation de traitement
- Timer: 3s

#### 2.6. Action du Chasseur (Si chasseur mort)

**Phase**: `hunter_action`

**Affichage**: Écran sombre (attente)
- Message: "Le chasseur agit..."
- Aucune action (pas chasseur)

#### 2.7. Révélation des Morts

**Phase**: `day_reveal`

**Écran**:
```
┌─────────────────────────────────┐
│      ☀️ AUBE DU JOUR 1          │
│                                 │
│     LES MORTS DE LA NUIT        │
│                                 │
│      [Carte Joueur 3]           │
│      🐺 LOUP-GAROU              │
│      [Nom du Joueur]            │
│                                 │
│      [CONTINUER]                │
│                                 │
│  Timer: 8s                      │
└─────────────────────────────────┘
```

**Affichage**:
- Liste des morts de la nuit
- Rôle révélé
- Cause de mort
- Animation de révélation

**Actions**: Cliquer "CONTINUER" (ou auto après 10s)

#### 2.8. Débat

**Phase**: `day_debate`

**Écran**:
```
┌─────────────────────────────────┐
│   ☀️ DÉBAT - JOUR 1             │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4] [Joueur 5] [Joueur6]│
│  [Joueur 7] [Joueur 8]          │
│  [Joueur 3 ✝]                   │
│                                 │
│  ─── Chat Global ───            │
│  Joueur1: Je pense que...      │
│  Joueur2: Je suis d'accord...  │
│  [Message input]                │
│                                 │
│  Timer: 175s                    │
└─────────────────────────────────┘
```

**Actions**:
- Discuter dans le chat global
- Voir les autres joueurs (vivants/morts)
- Timer: 180s (20s pour tests)

**Notes**:
- Les loups peuvent discuter mais doivent être prudents
- Ne peuvent pas révéler leur identité
- Peuvent bluffer

#### 2.9. Vote

**Phase**: `day_vote`

**Écran**:
```
┌─────────────────────────────────┐
│   ☀️ VOTE - JOUR 1              │
│                                 │
│  Sélectionnez un joueur à       │
│  éliminer                       │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4] [Joueur 5] [Joueur6]│
│  [Joueur 7] [Joueur 8]          │
│                                 │
│  Sélectionné: Joueur 4          │
│  [VOTER]                        │
│                                 │
│  Timer: 28s                     │
└─────────────────────────────────┘
```

**Actions**:
- Sélectionner un joueur à éliminer
- Cliquer "VOTER" → Soumission
- Voir confirmation si vote déjà effectué

**API**:
```javascript
POST /api/games/{game}/actions
{
  "type": "day_vote",
  "target_id": 4
}
```

#### 2.10. Résultat du Vote

**Phase**: `day_vote_result`

**Affichage**: Résultat du vote avec répartition

#### 2.11. Derniers Mots / Exécution

**Affichage**: Écran d'exécution si joueur éliminé

#### 2.12. Fin de Partie

**Phase**: `game_end`

**Affichage**:
- Si loups gagnent: "LES LOUPS ONT GAGNÉ" (rouge)
- Révélation de tous les rôles
- Liste des joueurs avec statuts

---

## 3. VOYANTE (SEER) 🔮 {#voyante}

### Équipe: Villageois
### Pouvoir: Découvre le rôle d'un joueur chaque nuit

### Flow complet

#### 3.1. Révélation du Rôle

**Écran**:
```
┌─────────────────────────────────┐
│      [Carte Voyante]            │
│         🔮 VOYANTE              │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: Chaque nuit,    │
│    découvrez le rôle d'un       │
│    joueur                       │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

**Couleur**: Violet (équipe villageois)

#### 3.2. Nuit 1 - Cupidon (Si présent)

**Affichage**: Écran sombre (attente)

#### 3.3. Phase des Loups

**Affichage**: Écran sombre (attente)
- Message: "Les loups agissent..."

#### 3.4. Phase du Garde

**Affichage**: Écran sombre (attente)
- Message: "Le garde agit..."

#### 3.5. Phase de la Sorcière

**Affichage**: Écran sombre (attente)
- Message: "La sorcière agit..."

#### 3.6. Phase de la Voyante (CHAQUE NUIT)

**Phase**: `night_seer`

**Écran**:
```
┌─────────────────────────────────┐
│    🌙 PHASE DE LA VOYANTE       │
│                                 │
│   Découvrez le rôle d'un joueur │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4] [Joueur 5] [Joueur6]│
│  [Joueur 7] [Joueur 8]          │
│                                 │
│  Sélectionnez un joueur         │
│                                 │
│  Timer: 12s                     │
└─────────────────────────────────┘
```

**Actions**:
- Sélectionner un joueur
- Cliquer sur un joueur → Révélation immédiate

**Résultat** (après sélection):
```
┌─────────────────────────────────┐
│    🌙 PHASE DE LA VOYANTE       │
│                                 │
│   RÉVÉLATION                    │
│                                 │
│      [Carte Joueur 3]           │
│      🔮 VOYANTE                 │
│                                 │
│   [Nom du Joueur]               │
│   est                           │
│   🐺 LOUP-GAROU                 │
│                                 │
│  ✓ Rôle découvert               │
│                                 │
│  Timer: 10s                     │
└─────────────────────────────────┘
```

**API**:
```javascript
POST /api/games/{game}/actions
{
  "type": "reveal_role",
  "target_id": 3
}

// Réponse
{
  "revealed_role": "werewolf",
  "target_player_name": "Joueur 3"
}
```

**Stockage** (suggestion frontend):
- Historique des révélations (à implémenter si souhaité)
- Liste des rôles découverts

#### 3.7. Processing de Nuit

**Affichage**: Écran sombre (attente)

#### 3.8. Révélation des Morts

**Affichage**: Liste des morts

#### 3.9. Débat

**Actions**:
- Discuter dans le chat global
- Utiliser les informations découvertes (sans révéler son rôle)
- Bluffer si nécessaire

#### 3.10. Vote

**Actions**: Voter pour un joueur à éliminer

#### 3.11. Fin de Partie

**Affichage**: Révélation de tous les rôles

---

## 4. SORCIÈRE (WITCH) 🧙‍♀️ {#sorcière}

### Équipe: Villageois
### Pouvoir: 2 potions (vie, mort)

### Flow complet

#### 4.1. Révélation du Rôle

**Écran**:
```
┌─────────────────────────────────┐
│      [Carte Sorcière]           │
│       🧙‍♀️ SORCIÈRE              │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: Vous avez 2     │
│    potions: une pour sauver,    │
│    une pour tuer                │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

**Couleur**: Violet (équipe villageois)

#### 4.2. Phase de la Sorcière (CHAQUE NUIT)

**Phase**: `night_witch`

**Écran**:
```
┌─────────────────────────────────┐
│   🌙 PHASE DE LA SORCIÈRE       │
│                                 │
│   Les loups ont choisi:         │
│   [Carte Joueur 3]              │
│   [Nom du Joueur]               │
│                                 │
│   Vos potions:                  │
│   [💚 Potion de Vie]  Disponible│
│   [💀 Potion de Mort] Disponible│
│                                 │
│   Actions:                      │
│   ○ Sauver la victime des loups │
│   ○ Tuer un joueur              │
│   ○ Ne rien faire               │
│                                 │
│   [SAUVER] [TUER] [PASSER]      │
│                                 │
│  Timer: 22s                     │
└─────────────────────────────────┘
```

**Actions possibles**:

1. **Sauver la victime des loups**:
   - Cliquer "SAUVER"
   - Confirmation → Utilise potion de vie
   - Victime sauvée (ne meurt pas cette nuit)

2. **Tuer un joueur**:
   - Cliquer "TUER"
   - Sélectionner un joueur:
   ```
   ┌─────────────────────────────────┐
   │   Sélectionnez une cible        │
   │                                 │
   │  [Joueur 1] [Joueur 2] [Joueur3]│
   │  [Joueur 4] [Joueur 5] [Joueur6]│
   │  [Joueur 7] [Joueur 8]          │
   │                                 │
   │  Sélectionné: Joueur 5          │
   │  [CONFIRMER]                    │
   └─────────────────────────────────┘
   ```
   - Confirmer → Utilise potion de mort
   - Cible meurt (en plus de la victime des loups si non sauvée)

3. **Ne rien faire**:
   - Cliquer "PASSER"
   - Aucune action

**États des potions**:
- Disponible: Bouton actif
- Utilisée: Bouton grisé, indiqué "Utilisée"

**API**:
```javascript
// Sauver
POST /api/games/{game}/actions
{
  "type": "witch_potion",
  "data": {
    "potion_type": "heal"
  }
}

// Tuer
POST /api/games/{game}/actions
{
  "type": "witch_potion",
  "target_id": 5,
  "data": {
    "potion_type": "kill"
  }
}

// Passer
POST /api/games/{game}/actions
{
  "type": "witch_potion",
  "data": {
    "potion_type": "skip"
  }
}
```

**Données backend**:
- `metadata.heal_potion`: true/false (disponibilité)
- `metadata.kill_potion`: true/false (disponibilité)

**Transitions**:
- Après action → `night_seer`

#### 4.3. Autres phases

**Mêmes que pour Voyante** (débat, vote, etc.)

---

## 5. GARDE (GUARD) 🛡️ {#garde}

### Équipe: Villageois
### Pouvoir: Protège un joueur des loups chaque nuit

### Flow complet

#### 5.1. Révélation du Rôle

**Écran**:
```
┌─────────────────────────────────┐
│       [Carte Garde]             │
│          🛡️ GARDE               │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: Chaque nuit,    │
│    protégez un joueur des loups │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

#### 5.2. Phase du Garde (CHAQUE NUIT)

**Phase**: `night_guard`

**Écran**:
```
┌─────────────────────────────────┐
│    🌙 PHASE DU GARDE            │
│                                 │
│   Protégez un joueur des loups  │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4] [Joueur 5] [Joueur6]│
│  [Joueur 7] [Joueur 8]          │
│                                 │
│  Sélectionné: Joueur 4          │
│  [PROTÉGER]                     │
│                                 │
│  ⚠️ Vous ne pouvez pas protéger │
│  le même joueur deux nuits      │
│  consécutives                   │
│                                 │
│  Dernière protection: Joueur 3  │
│                                 │
│  Timer: 18s                     │
└─────────────────────────────────┘
```

**Actions**:
- Sélectionner un joueur à protéger
- Cliquer "PROTÉGER" → Soumission
- Indication: Dernier joueur protégé (si applicable)
- Contrainte: Ne peut pas protéger le même joueur deux nuits consécutives

**API**:
```javascript
POST /api/games/{game}/actions
{
  "type": "protect",
  "target_id": 4
}
```

**Données backend**:
- `metadata.last_protected_id`: ID du dernier joueur protégé

**Transitions**:
- Après protection → `night_witch`

---

## 6. CUPIDON (CUPID) 💘 {#cupidon}

### Équipe: Villageois (mais peut gagner avec amoureux)
### Pouvoir: Lie deux joueurs en amoureux (nuit 1 uniquement)

### Flow complet

#### 6.1. Révélation du Rôle

**Écran**:
```
┌─────────────────────────────────┐
│      [Carte Cupidon]            │
│         💘 CUPIDON              │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: La première     │
│    nuit, liez deux joueurs      │
│    en amoureux                  │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

#### 6.2. Phase de Cupidon (NUIT 1 UNIQUEMENT)

**Phase**: `night_cupid`

**Écran**:
```
┌─────────────────────────────────┐
│    🌙 PHASE DE CUPIDON          │
│                                 │
│   Liez deux joueurs en          │
│   amoureux                      │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4] [Joueur 5] [Joueur6]│
│  [Joueur 7] [Joueur 8]          │
│                                 │
│  Sélection 1: Joueur 3          │
│  Sélection 2: Joueur 5          │
│                                 │
│  [LIER]                         │
│                                 │
│  Timer: 18s                     │
└─────────────────────────────────┘
```

**Actions**:
- Sélectionner 2 joueurs différents
- Cliquer "LIER" → Soumission
- Confirmation

**API**:
```javascript
POST /api/games/{game}/actions
{
  "type": "cupid_match",
  "data": {
    "player1_id": 3,
    "player2_id": 5
  }
}
```

**Résultat**:
- Les 2 joueurs deviennent amoureux
- Si un amoureux meurt, l'autre meurt aussi (de chagrin)
- Les amoureux gagnent s'ils sont les deux derniers vivants

**Note**: Cette phase n'apparaît QUE la première nuit (day_number = 1)

#### 6.3. Notification aux Amoureux

**Phase**: `day_reveal` (jour 1)

**Affichage pour les amoureux**:
- Message privé: "💘 Vous êtes amoureux avec [Nom] ❤️"
- Visible seulement aux 2 amoureux

#### 6.4. Autres phases

**Mêmes que pour Villageois** (débat, vote, etc.)

---

## 7. CHASSEUR (HUNTER) 🏹 {#chasseur}

### Équipe: Villageois
### Pouvoir: Tuer un joueur quand il meurt

### Flow complet

#### 7.1. Révélation du Rôle

**Écran**:
```
┌─────────────────────────────────┐
│      [Carte Chasseur]           │
│        🏹 CHASSEUR              │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: Quand vous      │
│    mourez, vous pouvez tuer     │
│    un joueur                    │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

#### 7.2. Nuits normales

**Affichage**: Écran sombre (attente)
- Aucune phase spéciale (comme villageois)
- Pas d'action pendant la nuit (sauf si mort)

#### 7.3. Action du Chasseur (Si mort la nuit)

**Phase**: `hunter_action`

**Écran**:
```
┌─────────────────────────────────┐
│   🌙 ACTION DU CHASSEUR         │
│                                 │
│   Vous êtes mort. Vous pouvez   │
│   tuer un joueur avant de       │
│   mourir                        │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4] [Joueur 5] [Joueur6]│
│  [Joueur 7] [Joueur 8]          │
│                                 │
│  Sélectionné: Joueur 5          │
│  [TIRER] [NE PAS TIRER]         │
│                                 │
│  Timer: 18s                     │
└─────────────────────────────────┘
```

**Actions**:
- Sélectionner un joueur à tuer
- Cliquer "TIRER" → Confirmation
- Ou cliquer "NE PAS TIRER" → Pas d'action

**API**:
```javascript
POST /api/games/{game}/actions
{
  "type": "hunter_shoot",
  "target_id": 5  // ou null pour ne pas tirer
}
```

**Transitions**:
- Après action → `day_reveal`

#### 7.4. Action du Chasseur (Si mort par vote)

**Phase**: `hunter_day_action` (ou pendant `day_execution`)

**Écran**: Identique à `hunter_action`

**Context**: 
- Après vote → Exécution → Si chasseur éliminé → Action

**Transitions**:
- Après action → Vérification victoire → Nuit suivante ou `game_end`

#### 7.5. Autres phases

**Si vivant**: Mêmes que pour Villageois
**Si mort**: Voir phases des morts

---

## 8. ANCIEN (ELDER) 👴 {#ancien}

### Équipe: Villageois
### Pouvoir: Résiste à 2 attaques des loups

### Flow complet

#### 8.1. Révélation du Rôle

**Écran**:
```
┌─────────────────────────────────┐
│      [Carte Ancien]             │
│         👴 ANCIEN               │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: Vous résistez   │
│    à 2 attaques des loups       │
│    avant de mourir              │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

#### 8.2. Nuits normales

**Affichage**: Écran sombre (attente)
- Aucune phase spéciale (comme villageois)
- Le pouvoir est passif (géré par le backend)

#### 8.3. Si attaqué par les loups

**Backend**: 
- Compte les attaques: `metadata.attack_count`
- Après 2 attaques → Meurt
- Si tué par vote (jour) → Meurt immédiatement (perd son pouvoir)

**Affichage**: Aucun changement visuel spécial (géré backend)

#### 8.4. Autres phases

**Mêmes que pour Villageois** (débat, vote, etc.)

---

## 9. FOU (FOOL) 🃏 {#fou}

### Équipe: Villageois (mais objectif différent)
### Pouvoir: Gagne s'il est éliminé par vote

### Flow complet

#### 9.1. Révélation du Rôle (TRICHEE)

**Écran**:
```
┌─────────────────────────────────┐
│      [Carte Voyante]            │
│         🔮 VOYANTE              │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: Chaque nuit,    │
│    découvrez le rôle d'un joueur│
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

**Note**: Le Fou voit "Voyante" au lieu de "Fou" (triche)

#### 9.2. Phase de la Voyante (TRICHEE)

**Phase**: `night_seer`

**Écran**: Identique à la vraie voyante

**Actions**:
- Peut "révéler" des rôles (mais résultat faux ou aléatoire)
- Pense être la voyante

**Backend**: 
- Les révélations sont fausses ou aléatoires
- Le vrai rôle est révélé seulement à la fin

#### 9.3. Autres phases

**Mêmes que pour Villageois** (débat, vote, etc.)

**Objectif**: Être éliminé par vote (jour) pour gagner

#### 9.4. Si éliminé par vote

**Backend**: 
- `game.state.fool_eliminated`: true
- Condition de victoire: Fou gagne seul

**Affichage**: Voir GameEnd (Fou gagnant)

---

## 10. VILLAGEOIS (VILLAGER) 👨‍🌾 {#villageois}

### Équipe: Villageois
### Pouvoir: Aucun

### Flow complet

#### 10.1. Révélation du Rôle

**Écran**:
```
┌─────────────────────────────────┐
│     [Carte Villageois]          │
│       👨‍🌾 VILLAGEOIS            │
│                                 │
│    Équipe: VILLAGEOIS           │
│    Description: Pas de pouvoir  │
│    spécial, mais votre vote     │
│    compte !                     │
│                                 │
│      [J'AI VU MON RÔLE]         │
└─────────────────────────────────┘
```

#### 10.2. Nuits normales

**Affichage**: Écran sombre (attente)
- Aucune phase spéciale
- Attente de la fin de la nuit

#### 10.3. Révélation des Morts

**Affichage**: Liste des morts

#### 10.4. Débat

**Actions**:
- Discuter dans le chat global
- Analyser les indices
- Argumenter

#### 10.5. Vote

**Actions**: Voter pour un joueur à éliminer

#### 10.6. Fin de Partie

**Affichage**: Révélation de tous les rôles

---

## 11. MORTS (DEAD PLAYERS) 💀 {#morts}

### Tous les joueurs morts (quel que soit le rôle)

### Flow après la mort

#### 11.1. Notification de mort

**Événement**: `.PlayerKilled`

**Affichage**: 
- Transition: Écran de mort
- Message: "Vous êtes mort"
- Révélation du rôle (si applicable)

#### 11.2. Phases suivantes

**Affichage**:
- Écrans grisés ou opaques
- Pas d'actions possibles (sauf chasseur)
- Chat dans le channel "dead"

#### 11.3. Chat des Morts

**Channel**: "dead"

**Écran**:
```
┌─────────────────────────────────┐
│   ☀️ DÉBAT - JOUR 1             │
│                                 │
│  [Joueur 1] [Joueur 2] [Joueur3]│
│  [Joueur 4 ✝] [Joueur 5 ✝]     │
│                                 │
│  ─── Chat Morts ───             │
│  Mort1: Je savais que...       │
│  Mort2: Moi aussi...            │
│  [Message input]                │
│                                 │
│  ⚠️ Vous êtes mort              │
└─────────────────────────────────┘
```

**Actions**:
- Chatter dans le channel "dead"
- Voir les autres morts
- Observer la partie (spectateur)

#### 11.4. Vote

**Affichage**: Pas de vote (mort)

#### 11.5. Fin de Partie

**Affichage**: Révélation de tous les rôles + statuts

---

## 📝 NOTES FINALES

### Phases communes

**Tous les joueurs vivants**:
- `day_debate`: Débat
- `day_vote`: Vote
- `day_reveal`: Révélation des morts
- `day_execution`: Exécution

**Tous les joueurs**:
- `role_reveal`: Révélation du rôle
- `day_vote_result`: Résultat du vote
- `day_last_words`: Derniers mots (observateur)
- `game_end`: Fin de partie

### Phases privées

**Par rôle**:
- Loup-Garou: `night_wolves` + chat "wolves"
- Voyante: `night_seer`
- Sorcière: `night_witch`
- Garde: `night_guard`
- Cupidon: `night_cupid` (nuit 1 uniquement)
- Chasseur: `hunter_action` / `hunter_day_action` (si mort)

### Transitions automatiques

**Toutes les phases**:
- Timer: Avance automatiquement après expiration
- Actions: Avance si tous les joueurs concernés ont agi
- Backend: Gère les transitions via StateMachine

### Feedback utilisateur

**Notifications**:
- Actions réussies: "Action enregistrée" (success)
- Erreurs: Message d'erreur (error)
- Confirmations: "Confirmation enregistrée" (info)

**États visuels**:
- Loading: Indicateur de chargement
- Disabled: Boutons grisés
- Selected: Éléments sélectionnés (surlignés)
- Active: Phases actives (animation)

---

**Document de référence pour le design frontend 🎨**
