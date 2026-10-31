# Mon Comptable (Optima PME PRO) 🚀

Application SaaS complète de gestion comptable, financière, de stock et de pilotage opérationnel pour PME, développée conformément au cahier des charges et à la charte graphique officielle.

---

## 1. Stack Technique

### Frontend
- **Framework** : React.js 18 + Vite + TypeScript
- **Style & UI** : Tailwind CSS, Lucide Icons, Plus Jakarta Sans
- **Visualisations & Graphiques** : Recharts (Courbes & Barres bicolores)
- **Routage** : React Router v6
- **Architecture** : Gestion d'état multi-espaces (*Mon Comptable*, *Interface de Gestion*, *Portail Client*), simulation RBAC dynamique intégrée.

### Backend
- **Framework** : Node.js avec NestJS + TypeScript
- **ORM & Migrations** : Prisma ORM
- **Base de Données** : **PostgreSQL** avec contraintes de précision décimale `Decimal(12, 2)` (aucun flottant pour la comptabilité).
- **Sécurité** : JWT, Bcrypt, Guards RBAC (`RolesGuard`) et contrôle strict de l'accréditation des gérants (`AccreditationGuard`).
- **Validation** : DTOs typés avec `class-validator` et `class-transformer`.
- **Documentation API** : Swagger / OpenAPI accessible sur `/api/docs`.

### Conteneurisation
- **Docker Compose** : Orchestration PostgreSQL 16 + Backend NestJS + Frontend React.

---

## 2. Organisation de l'Application

### Espace A — « Mon Comptable »
- **Dashboard Comptable (Temps Réel)** : Chiffre d'affaires HT, Résultat Net estimé (avec taux de marge), Trésorerie disponible consolidée (Banque + Caisse), Créances clients, Dettes fournisseurs, Valorisation du stock actif et BFR estimé.
- **Recettes & Dépenses** : Contrôle des décaissements et conformité fiscale (ex: DGI / retenues à la source).
- **Factures Clients** : Cycle complet (Brouillon, Envoyée, Partiellement payée, Payée, En retard).
- **Règlements & Paiements** : Mise à jour automatique des soldes et du statut des factures.
- **Trésorerie** : Suivi des flux réels selon la formule :
  $$\text{Solde Actuel} = \text{Solde Initial} + \text{Recettes} - \text{Dépenses}$$
- **Stocks & Articles** : Inventaire permanent, seuils d'alerte automatiques, interdiction stricte des stocks négatifs.
- **Tiers** : Fiches clients certifiées et fournisseurs avec encours.

### Espace B — « Interface de Gestion » (Accréditation Requise)
- **File d'Attente Interactive** : Gestion des tickets en temps réel (#A-104, #A-105, etc.), priorités (Normal, Prioritaire, Urgent), distinction avec/sans rendez-vous.
- **Pilotage des Postes (Bureaux 1 à 6)** : États en direct (Occupé, Libre, En pause, Maintenance) et temps d'attente estimé.
- **Dashboard Activité** : Fréquentation horaire, charge du personnel, notation et évaluations clients (étoiles & avis).
- **Administration & Gouvernance** : Attribution des rôles et accréditation des gérants par l'Administrateur, journal d'audit des actions sensibles.

---

## 3. Lancement Rapide

### Option A — Avec Docker Compose (Recommandé)
```bash
# À la racine du dossier mon-comptable
docker compose up --build
```
- Frontend : `http://localhost:3000`
- Backend API : `http://localhost:4000/api`
- Documentation Swagger : `http://localhost:4000/api/docs`

### Option B — En Développement Local
1. **Lancer PostgreSQL** et vérifier les identifiants dans `backend/.env`.
2. **Backend NestJS** :
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run start:dev
   ```
3. **Frontend React** :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 4. Profils de Test (RBAC)
Vous pouvez basculer d'un profil à l'autre directement depuis l'en-tête (menu utilisateur) :
- **Thomas Laurent** (`admin@optima.fr` / `Admin123!`) : **Administrateur** — Accès complet et pouvoir d'accréditation.
- **Patrick Mukendi** (`gerant@optima.fr` / `Gerant123!`) : **Gérant non accrédité** — Accès bloqué à l'Interface de Gestion jusqu'à validation.
- **Mireille Kabongo** (`compta@optima.fr` / `Compta123!`) : **Comptable senior** — Tenue des comptes et visa opérationnel.
