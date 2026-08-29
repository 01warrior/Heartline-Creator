# Heartline Creator

Createur de contenu poème — une application TypeScript pour générer des "heartlines" (poèmes / courts textes) à l'aide d'une API de génération.

## Sommaire

- Description
- Prérequis
- Installation
- Configuration
- Lancement en local
- Déploiement
- Contribuer
- Licence & contact

## Description

Heartline Creator permet de générer automatiquement du contenu poétique via une API (ex. Gemini). Le projet est principalement écrit en TypeScript.

## Prérequis

- Node.js (version recommandée : 18+)
- Un compte et une clé API pour le service de génération (ex. Gemini)

## Installation

1. Récupère le dépôt :
   - git clone https://github.com/01warrior/Heartline-Creator.git
   - cd Heartline-Creator

2. Installe les dépendances :
   ```bash
   npm install
   ```

## Configuration

Crée un fichier `.env.local` à la racine du projet (ou modifie-le s'il existe) et ajoute ta clé API :

```env
GEMINI_API_KEY=ta_cle_api_ici
```

Veille à ne pas committer ce fichier contenant des secrets.

## Lancement en local

Pour démarrer l'application en mode développement :

```bash
npm run dev
```

L'application sera accessible à l'adresse indiquée par la sortie de la commande (généralement http://localhost:3000).

## Build & Déploiement

Pour préparer une version de production :

```bash
npm run build
npm run start
```

(Adapte ces commandes selon ton framework / hébergeur si nécessaire — ex. Vercel, Netlify, etc.)

## Contribuer

Contributions bienvenues : ouvre une issue pour proposer une fonctionnalité ou signaler un bug, puis envoie une pull request en expliquant clairement les changements.

## Contact

Auteur : 01warrior  
Description du dépôt : Createur de contenu poeme
