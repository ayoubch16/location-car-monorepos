# Location de Voiture — API Laravel 11

## Stack
- **Laravel 11** + **Laravel Sanctum** (token auth)
- **MySQL**

---

## Installation

```bash
# 1. Install dependencies
composer install

# 2. Copy env
cp .env.example .env

# 3. Generate app key
php artisan key:generate

# 4. Configure your DB in .env
#    DB_DATABASE=location_voiture
#    DB_USERNAME=root
#    DB_PASSWORD=yourpassword

# 5. Run migrations + seed admin
php artisan migrate --seed

# 6. Start server
php artisan serve
```

**Admin créé par défaut:**
- Email: `admin@location-voiture.com`
- Password: `Admin@1234`

---

## API Endpoints

### Auth (public)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Inscription client |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion (auth requis) |
| GET  | `/api/auth/me` | Utilisateur connecté |
| POST | `/api/auth/forgot-password` | Demande reset mdp |
| POST | `/api/auth/reset-password` | Reset mdp avec token |

### Voitures
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/voitures` | Public | Liste (filtres: disponible, marque, prix_max) |
| GET | `/api/voitures/{id}` | Public | Détail |
| POST | `/api/voitures` | Admin | Créer |
| PUT | `/api/voitures/{id}` | Admin | Modifier |
| DELETE | `/api/voitures/{id}` | Admin | Supprimer |

### Locations
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/locations` | Auth | Mes locations (client) / Toutes (admin) |
| GET | `/api/locations/{id}` | Auth | Détail |
| POST | `/api/locations` | Auth | Créer une location |
| POST | `/api/locations/{id}/cancel` | Client | Annuler |
| PUT | `/api/locations/{id}` | Admin | Changer statut |
| DELETE | `/api/locations/{id}` | Admin | Supprimer |

### Paiements
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/paiements` | Auth | Mes paiements (client) / Tous (admin) |
| GET | `/api/paiements/{id}` | Auth | Détail |
| POST | `/api/paiements/{id}/pay` | Client | Payer |
| POST | `/api/paiements/{id}/refund` | Admin | Rembourser |

### Utilisateurs (Admin seulement)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/users` | Liste tous les users |
| GET | `/api/users/{id}` | Détail |
| POST | `/api/users` | Créer user |
| PUT | `/api/users/{id}` | Modifier |
| DELETE | `/api/users/{id}` | Supprimer |

### Profil (tout utilisateur connecté)
| Method | URL | Description |
|--------|-----|-------------|
| PUT | `/api/profile` | Modifier son propre profil |

---

## Authentification

Ajouter le header dans chaque requête protégée :
```
Authorization: Bearer {token}
```

---

## Flux complet (exemple client)

```
1. POST /api/auth/register  → token
2. GET  /api/voitures?disponible=true  → choisir une voiture
3. POST /api/locations  { voiture_id, date_debut, date_fin, ... }
4. POST /api/paiements/{id}/pay  { methode: "carte_bancaire" }
5. GET  /api/locations  → voir mes locations
```
