# 🧪 Test Management — Frontend (corrigé)

Frontend React + Vite + Tailwind connecté au backend Spring Boot `testmanagement`.

## 🚀 Lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de dev (port 5173)
npm run dev
```

Le backend doit tourner sur **http://localhost:8081** (configuré dans `src/api/axios.js`).

## 🔌 Lancement du backend

```bash
# Depuis le dossier testmanagement/
mvn spring-boot:run
```

Prérequis backend :
- MySQL en local (port 3306) — la base `testmanagement` est créée automatiquement
- Java 17+
- Maven

## ✅ Corrections appliquées

### 1. Champs de formulaire invisibles
Avant : `bg-gray-100` (= couleur du body) + `border-transparent` rendaient les inputs invisibles dans les modals.
Après : `bg-white` + `border-gray-300`.

### 2. Module — `nom` au lieu de `titre`
Le `ModuleDTO` backend attend `nom`, pas `titre`. Le frontend envoie maintenant le bon champ.

### 3. Scénario — `objectif` au lieu de `description`
Le `ScenarioDTO` backend a un champ `objectif`. Renommé côté frontend.

### 4. Cas de test — champs `etapes` et `resultatAttendu` ajoutés
Le `CasDeTestDTO` backend a 5 champs : titre, description, étapes, résultat attendu, scenarioId. Le formulaire les inclut tous maintenant.

### 5. Relation parent (module → scénario → cas) reconstruite côté frontend
Le backend met `@JsonIgnore` sur les relations parent dans les entités. Donc :
- `Scenario.module` n'arrive jamais au frontend
- `CasDeTest.scenario` n'arrive jamais au frontend

**Solution** : le frontend croise les requêtes :
- Scénarios : on charge les modules, puis pour chaque module on appelle `/api/scenarios/module/{moduleId}` et on associe le `moduleId` localement.
- Cas de test : pareil — modules → scénarios → cas de test.

### 6. Boutons "Nouveau" qui semblaient ne rien faire
Avant : désactivés silencieusement quand pas de projet/module/scénario.
Après : message explicite ("Créez d'abord un module avant d'ajouter un scénario", etc.).

## 📋 Ordre d'utilisation côté testeur

1. Un **Admin** crée un **projet** et y assigne le testeur
2. Le testeur va sur **Modules** → crée un module
3. Le testeur va sur **Scénarios** → choisit un module, crée un scénario
4. Le testeur va sur **Cas de test** → choisit un scénario, crée un cas avec étapes et résultat attendu

## 🛠️ Stack

- React 18 + React Router
- Vite
- Tailwind CSS
- Axios (avec intercepteur JWT)
- React Hot Toast
- Lucide React (icônes)
- Recharts (graphiques)

## 🌐 Configuration

L'URL du backend est dans `src/api/axios.js` :
```js
export const API_BASE_URL = 'http://localhost:8081';
```

CORS autorisé côté backend pour `http://localhost:5173` ✅
