# StudentCourseAPI

Projet pédagogique pour le module **Tests et Qualité** à l’Efrei.

## Contexte

Ce projet back-end (Node.js/Express) sert de base pour l’évaluation finale du module.  
L’objectif est d’améliorer la qualité du code et la couverture de tests à partir d’un projet existant.

## Objectifs pour les étudiants

- **Appliquer les standards de qualité** : linters (ESLint), formatage (Prettier), bonnes pratiques.
- **Intégrer des outils d’analyse statique** : exemple : SonarQube, Codacy.
- **Réaliser une revue de code collaborative** et la documenter.
- **Mettre en place une suite de tests automatisés** (unitaires et intégration) avec Jest, Mocha ou Cypress.
- **Intégrer les tests dans une pipeline CI/CD** (GitHub Actions).
- **Gérer la couverture de tests**.
- **Compléter la documentation technique** : installation, architecture, endpoints API, guides d’usage.
- **Finaliser la documentation Swagger** (manuelle ou automatique).
- **Fournir un dépôt Git propre, structuré et commenté**.

## Fonctionnalités

- Gestion des étudiants et des cours (création, modification, suppression, inscription).
- Règles métier : unicité email/titre, pagination, recherche, suppression protégée, etc.
- API REST documentée avec Swagger.

## À faire

- Corriger et compléter les tests existants.
- Ajouter de nouveaux tests pour améliorer la couverture.
- Mettre en place ESLint et Prettier.
- Intégrer la vérification de qualité et les tests dans la CI.
- Finaliser la documentation Swagger.
- Intégrer Codacy comme outil d’analyse statique
- Ajouter un template de Pull Request (.github/pull_request_template.md).
- Produire une Pull Request bien documentée avec des messages de commits pertinents.
- Rédiger une documentation technique complète (Markdown ou générateur).
- Fournir un dépôt Git propre, lisible et bien organisé.

## Démarrage rapide

```sh
npm install
npm run dev
```

- Accès à la documentation Swagger : `/api-docs`
- Lancer les tests : `npm test`
- Linter : `npm run lint`
- Formatage : `npm run format`

---

**À vous de jouer pour améliorer la qualité et la fiabilité du projet !**
