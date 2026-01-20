# Dress by Ameksa

## Projet Fil Rouge – Plateforme de location de caftans et takchitas

---

## 1. Présentation du projet

**Dress by Ameksa** est une plateforme web innovante dédiée à la location de caftans, takchitas et robes de soirée.

Elle permet aux utilisatrices de :
- Rechercher une tenue
- Consulter les détails
- Tester virtuellement la tenue grâce à un module **3D Try-On basé sur IA**
- Finaliser une réservation en ligne

Ce projet vise à moderniser le modèle traditionnel de location de tenues au Maroc.

---

## 2. Objectifs du projet

### Objectif général
Développer une plateforme complète permettant la visualisation, le test virtuel, la réservation et la gestion des tenues.

### Objectifs spécifiques
- Mettre en place un catalogue structuré et filtré
- Permettre la consultation détaillée de chaque tenue
- Intégrer une fonctionnalité **3D Try-On** utilisant l'IA
- Proposer une réservation sécurisée avec paiement
- Offrir un espace client pour gérer les réservations
- Fournir un espace vendeur pour gérer sa boutique
- Fournir un espace administrateur complet
- Assurer une expérience fluide, intuitive et responsive

---

## 3. Public cible

- **Clientes** : Femmes recherchant une tenue pour un événement (mariage, fiançailles, soirée, henné…)
- **Vendeurs** : Boutiques ou créatrices souhaitant proposer leurs modèles sur la plateforme
- **Administrateurs** : Gestionnaires de la plateforme

---

## 4. Acteurs du système

### 4.1 Acteurs Principaux

| Acteur | Description | Authentification |
|--------|-------------|------------------|
| **Visiteur** | Utilisateur non connecté qui consulte le site | Non requise |
| **Client** | Utilisatrice inscrite qui réserve des tenues | Requise (JWT) |
| **Vendeur** | Propriétaire de boutique qui gère ses tenues | Requise (JWT) |
| **Admin** | Gestionnaire de la plateforme | Requise (JWT) |

### 4.2 Acteurs Secondaires (Systèmes externes)

| Acteur | Description |
|--------|-------------|
| **API Gemini** | Service IA pour la génération d'images 3D Try-On |
| **Service Email** | Envoi de notifications et confirmations |
| **Service Paiement** | Traitement des transactions |
| **Cloudinary** | Stockage et gestion des images |

---

## 5. Périmètre fonctionnel

### 5.1 Espace Visiteur (Sans authentification)

#### Page d'accueil
- Présentation du concept Dress by Ameksa
- Mise en avant des modèles populaires ou nouveaux
- Accès rapide au catalogue

#### Catalogue des tenues
- Filtration par : type (caftan, takchita, robe), couleur, prix, taille, disponibilité
- Recherche par mot-clé
- Pagination des résultats

#### Détails d'une tenue
- Photos haute qualité
- Description complète
- Taille disponible
- Prix de location
- Disponibilité par date
- Suggestions de modèles similaires

#### Consultation boutique
- Voir les informations d'une boutique
- Parcourir les tenues d'une boutique

#### Inscription / Connexion
- Créer un compte (Client ou Vendeur)
- Se connecter à son espace

---

### 5.2 Espace Client (Authentification requise)

#### Try-On 3D — Fonctionnalité IA (Fonctionnalité majeure)

**Objectif :** Permettre à l'utilisatrice de visualiser virtuellement la tenue choisie sur son avatar 3D généré automatiquement via IA.

**Fonctionnement :**
1. L'utilisatrice choisit un modèle (caftan / takchita)
2. Elle ouvre le bouton "Essayer en 3D"
3. Elle remplit un formulaire :
   - Taille (cm)
   - Poids (kg)
   - Couleur de peau
   - Morphologie (fine / moyenne / ronde)
   - Option : upload d'une photo (pour ressemblance)
4. Le système construit une prompt dynamique
5. L'API Gemini (IA Image Generation) génère :
   - Une image 3D réaliste
   - Avec la tenue sélectionnée, adaptée à la morphologie
6. L'utilisatrice peut :
   - Télécharger le rendu 3D
   - Tester plusieurs tenues
   - Continuer vers la réservation

**Contraintes :**
- Ne pas utiliser Three.js
- Utiliser une prompt IA + API Gemini pour générer le rendu réaliste
- Protection et suppression des images envoyées

#### Système de réservation
- Sélection des dates (début/fin)
- Vérification automatique de la disponibilité
- Formulaire d'informations personnelles
- Paiement sécurisé
- Confirmation de réservation + email

#### Espace client
- Gestion du profil
- Historique des réservations
- Statut des réservations : en attente / confirmée / en cours / rendue
- Réception des notifications

---

### 5.3 Espace Vendeur (Authentification requise)

#### Gestion de la boutique
- Créer et configurer sa boutique
- Modifier les informations (nom, description, logo, adresse, contact)
- Consulter le statut de validation

#### Gestion des tenues
- **Ajouter** une nouvelle tenue
  - Nom, description, type, couleur
  - Tailles disponibles
  - Prix de location
  - Upload d'images (via Cloudinary)
- **Modifier** une tenue existante
- **Supprimer** une tenue
- Définir la disponibilité

#### Gestion des réservations
- Voir toutes les réservations de sa boutique
- **Confirmer** ou **refuser** une réservation
- **Marquer** une tenue comme rendue
- Gérer les conflits de dates

#### Statistiques boutique
- Nombre de réservations
- Tenues les plus demandées
- Revenus générés
- Suivi des performances

---

### 5.4 Espace Admin (Authentification requise)

#### Gestion des boutiques
- Voir toutes les boutiques (en attente, validées, suspendues)
- **Valider** une nouvelle boutique
- **Suspendre** une boutique
- Consulter les détails d'une boutique

#### Gestion des utilisateurs
- Liste des clients, vendeurs et admins
- Création de nouveaux admins
- Désactivation/Activation de comptes

#### Supervision des réservations
- Voir toutes les réservations de la plateforme
- Gérer les litiges entre clients et vendeurs
- Archivage des réservations terminées

#### Tableau de bord
- Nombre de réservations / mois
- Revenus estimés de la plateforme
- Modèles les plus demandés
- Statistiques par boutique
- Gestion des commissions

---

## 6. Contraintes techniques

### Stack MERN
| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React.js + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Base de données** | MongoDB |
| **Authentification** | JWT + bcrypt |
| **Upload images** | Multer + Cloudinary |
| **Versioning** | GitHub |
| **Design** | Figma / Canva |
| **IA Try-On 3D** | API Gemini + Prompt Engineering |

---

## 7. Contraintes ergonomiques

- Interface **responsive** (mobile-first)
- Navigation fluide et intuitive
- Visuels attractifs (tenues mises en valeur)
- Performances optimisées
- Interface d'essayage 3D accessible et simple

---

## 8. Arborescence du site

### Front-office (Public)
```
├── Accueil
├── Catalogue
│   ├── Filtres
│   └── Recherche
├── Détails tenue
├── Boutiques
│   └── Détails boutique
├── Contact
└── Connexion / Inscription
```

### Espace Client
```
├── Try-On 3D
├── Réservation
├── Mon Profil
├── Mes Réservations
└── Mes Notifications
```

### Espace Vendeur
```
├── Ma Boutique
│   └── Modifier infos
├── Mes Tenues
│   ├── Ajouter
│   ├── Modifier
│   └── Supprimer
├── Réservations
│   ├── En attente
│   ├── Confirmées
│   └── Historique
└── Statistiques
```

### Back-office (Admin)
```
├── Tableau de bord
├── Boutiques
│   ├── En attente
│   ├── Validées
│   └── Suspendues
├── Utilisateurs
│   ├── Clients
│   ├── Vendeurs
│   └── Admins
├── Réservations
└── Commissions
```

---

## 9. Diagrammes UML

Les diagrammes UML du projet sont disponibles dans les fichiers suivants :

| Diagramme | Fichier |
|-----------|---------|
| Diagramme de Classe | `diagramme-classe-dressByAmeksa.drawio` |
| Diagramme de Cas d'Utilisation | `diagramme-cas-utilisation-dressByAmeksa.drawio` |

### Résumé du Diagramme de Classe

```
Utilisateur (classe parent)
    ├── Client (hérite)
    ├── Vendeur (hérite)
    └── Admin (hérite)

Vendeur ──possède──► Boutique (1:1)
Boutique ──contient──► Tenue (1:*)
Client ──effectue──► Reservation (1:*)
Tenue ──concerne──► Reservation (1:*)
Reservation ──génère──► Paiement (1:0..1)
Client ──utilise──► TryOn3D (1:*)
```

### Résumé du Diagramme de Cas d'Utilisation

**Visiteur (sans auth)** : Consulter accueil, Parcourir catalogue, Voir détails, S'inscrire, Se connecter

**Client (auth requise)** : Try-On 3D, Réserver, Payer, Gérer profil, Historique

**Vendeur (auth requise)** : Gérer boutique, Gérer tenues, Gérer réservations, Statistiques

**Admin (auth requise)** : Gérer boutiques, Gérer utilisateurs, Superviser réservations, Tableau de bord

---

## 10. Planning prévisionnel

Gestion via **Jira** (sprints) :

| Sprint | Description |
|--------|-------------|
| Sprint 1 | Maquettes & architecture |
| Sprint 2 | Front catalogue + détails |
| Sprint 3 | Backend utilisateurs + tenues |
| Sprint 4 | Réservation + disponibilité |
| Sprint 5 | Espace Vendeur |
| Sprint 6 | Admin panel |
| Sprint 7 | Intégration Try-On 3D |
| Sprint 8 | Tests & optimisation |
| Sprint 9 | Rapport + présentation |

---

## 11. Livrables

- [x] Cahier des charges final
- [ ] Maquettes UI/UX
- [ ] Code source complet
- [ ] Base de données
- [ ] Documentation API
- [ ] Rapport final
- [ ] Présentation PowerPoint

---

## 12. Sécurité

### Authentification & Autorisation
- **JWT** (JSON Web Tokens) pour la gestion des sessions
- **bcrypt** pour le hashage des mots de passe
- Middleware de vérification des rôles (Client, Vendeur, Admin)

### Protection des données
- Validation des entrées utilisateur
- Protection contre les injections (SQL, NoSQL)
- HTTPS obligatoire en production
- Suppression automatique des images uploadées (Try-On)

---

## 13. Conclusion

**Dress by Ameksa** est une solution moderne et innovante qui révolutionne la location de caftans et takchitas au Maroc.

Grâce à sa fonctionnalité exclusive **3D Try-On basée sur l'IA**, la plateforme offre une expérience unique permettant aux utilisatrices de visualiser la tenue sur elles avant de réserver.

Le système multi-acteurs (Visiteur, Client, Vendeur, Admin) permet une gestion complète de l'écosystème de location de tenues traditionnelles.

C'est un projet ambitieux, complet et parfaitement adapté pour un projet de fin d'études professionnel.

---

## 14. Installation et Démarrage

### Prérequis
- Node.js (v18+)
- MongoDB
- Compte Cloudinary
- Clé API Gemini

### Installation

```bash
# Cloner le projet
git clone <url-du-repo>

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

### Configuration

Créer un fichier `.env` dans le dossier backend :

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dressByAmeksa
JWT_SECRET=votre_secret_jwt
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
GEMINI_API_KEY=votre_cle_gemini
```

### Démarrage

```bash
# Démarrer le backend
cd backend
npm run dev

# Démarrer le frontend
cd frontend
npm start
```

---

## Auteur

**Projet Fil Rouge** - Formation Développement Web Full Stack

---

*Document mis à jour le : Janvier 2026*
#   D r e s s - B y - A m e k s a  
 #   D r e s s - B y - A m e k s a  
 