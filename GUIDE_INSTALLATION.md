# Guide d'Installation - Dress By Ameksa

Plateforme de location de tenues marocaines traditionnelles (caftans & takchitas).

## Prerequis

- **Node.js** 18+
- **MongoDB** 6.0+ (en local ou MongoDB Atlas)
- **Git**

## Services externes necessaires

| Service | Utilite | Lien |
|---------|---------|------|
| MongoDB | Base de donnees | https://www.mongodb.com/try/download/community |
| Cloudinary | Stockage images | https://cloudinary.com |
| Stripe | Paiement | https://stripe.com |
| HuggingFace | Essayage virtuel 3D | https://huggingface.co/settings/tokens |

---

## 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/Dress-By-Ameksa.git
cd Dress-By-Ameksa
```

## 2. Installation Backend

```bash
cd backend
npm install
```

### Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvrir `.env` et remplir :

```env
# Serveur
PORT=5001
NODE_ENV=development

# Base de donnees MongoDB
MONGODB_URI=mongodb://localhost:27017/dressByAmeksa

# Authentification JWT
JWT_SECRET=votre_secret_jwt_aleatoire
JWT_EXPIRE=7d

# Cloudinary (stockage images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Stripe (paiement)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# HuggingFace (essayage virtuel 3D)
HF_API_TOKEN=hf_...

# Email (notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app

# URL Frontend
CLIENT_URL=http://localhost:3000
```

### Obtenir les cles des services

**Cloudinary :**
1. Creer un compte sur https://cloudinary.com
2. Dashboard → copier Cloud Name, API Key, API Secret

**Stripe :**
1. Creer un compte sur https://stripe.com
2. Developers → API Keys → copier la Secret Key (test)
3. Developers → Webhooks → ajouter endpoint `http://localhost:5001/api/paiement/webhook`
4. Copier le Webhook Secret

**HuggingFace :**
1. Creer un compte sur https://huggingface.co
2. Settings → Access Tokens → creer un token avec permission "Read"

**Email (Gmail) :**
1. Activer la verification en 2 etapes sur Google
2. Google Account → Securite → Mots de passe des applications → generer un mot de passe

## 3. Installation Frontend

```bash
cd ../frontend
npm install
```

### Configurer les variables d'environnement

Creer le fichier `frontend/.env` :

```env
VITE_API_URL=http://localhost:5001/api
```

## 4. Demarrer MongoDB

### Option A : MongoDB local
```bash
mongod
```

### Option B : MongoDB Atlas
Utiliser l'URI Atlas dans `MONGODB_URI` du `.env` backend.

## 5. Alimenter la base de donnees (seed)

```bash
cd backend
npm run seed
```

Cela cree automatiquement :

| Donnee | Detail |
|--------|--------|
| Admin | admin@dressByAmeksa.com / admin123 |
| Vendeur 1 | fatima@boutique.com / vendeur123 (Dar Al Caftan) |
| Vendeur 2 | khadija@boutique.com / vendeur123 (Marrakech Prestige) |
| Vendeur 3 | naima@boutique.com / vendeur123 (Fes Haute Couture) |
| Client 1 | sara@client.com / client123 |
| Client 2 | amina@client.com / client123 |
| 3 Boutiques | Avec informations completes |
| 15 Tenues | Avec tailles, couleurs et images |
| 3 Reservations | Exemples de reservations |

## 6. Lancer l'application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Le serveur demarre sur http://localhost:5001

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
L'application est accessible sur http://localhost:3000

---

## Structure du projet

```
Dress-By-Ameksa/
├── backend/
│   ├── config/          # Configuration (DB, Cloudinary)
│   ├── controllers/     # Logique metier
│   │   ├── admin/       # Controllers admin
│   │   ├── auth/        # Authentification
│   │   ├── client/      # Controllers client
│   │   ├── public/      # Routes publiques
│   │   └── vendeur/     # Controllers vendeur
│   ├── middleware/       # Auth, upload, validation
│   ├── models/          # Schemas Mongoose
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires (IA, notifications)
│   ├── seed.js          # Script de seed
│   └── server.js        # Point d'entree
├── frontend/
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── context/     # AuthContext
│   │   ├── hooks/       # Hooks personnalises
│   │   ├── pages/       # Pages (admin, client, vendeur, public)
│   │   ├── routes/      # Configuration routeur
│   │   └── services/    # Appels API (Axios)
│   └── vite.config.js
└── GUIDE_INSTALLATION.md
```

## Technologies utilisees

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js, Mongoose |
| Base de donnees | MongoDB |
| Authentification | JWT (JSON Web Tokens) |
| Paiement | Stripe |
| Images | Cloudinary |
| IA (Try-On 3D) | FLUX.1-schnell + IDM-VTON (HuggingFace) |
| Notifications | React Hot Toast, Nodemailer |

## Scripts disponibles

### Backend
```bash
npm start       # Demarrer en production
npm run dev     # Demarrer en developpement (nodemon)
npm run seed    # Alimenter la base de donnees
```

### Frontend
```bash
npm run dev     # Demarrer le serveur de developpement
npm run build   # Build pour la production
npm run preview # Previsualiser le build
```

## Ports par defaut

| Service | Port |
|---------|------|
| Backend API | 5001 |
| Frontend (Vite) | 3000 |
| MongoDB | 27017 |
