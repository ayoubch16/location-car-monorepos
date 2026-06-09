<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable; // Classe de base Laravel pour les utilisateurs authentifiables
use Illuminate\Notifications\Notifiable;                // Permet d'envoyer des notifications (email, SMS...)
use Laravel\Sanctum\HasApiTokens;                       // Ajoute les méthodes createToken(), tokens(), currentAccessToken()

class User extends Authenticatable
{
    // HasApiTokens  → gestion des tokens Sanctum (accès API)
    // HasFactory    → permet de créer des faux utilisateurs pour les tests
    // Notifiable    → permet d'envoyer des notifications
    use HasApiTokens, HasFactory, Notifiable;

    // Liste des champs que l'on peut remplir via User::create() ou $user->update()
    // Protège contre les attaques de mass-assignment
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'adresse',
        'num_permis',
        'date_naissance',
        'role',
    ];

    // Champs exclus automatiquement des réponses JSON (ne jamais exposer le mot de passe)
    protected $hidden = [
        'password',
        'remember_token', // Token Laravel pour le "se souvenir de moi" (non utilisé en API)
    ];

    // Casts automatiques : Laravel convertit ces champs au bon type PHP lors de la lecture
    protected $casts = [
        'email_verified_at' => 'datetime',       // Converti en objet Carbon (date)
        'date_naissance'    => 'date',            // Converti en objet Carbon (date sans heure)
        'password'          => 'hashed',          // Hashé automatiquement à l'écriture (Laravel 10+)
    ];

    /**
     * Retourne true si l'utilisateur est administrateur.
     * Utilisé dans les middlewares IsAdmin et les contrôleurs.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Retourne true si l'utilisateur est un client standard.
     */
    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    /**
     * Relation : un utilisateur a plusieurs locations.
     * Permet d'écrire : $user->locations  ou  $user->locations()->where(...)
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    /**
     * Relation : un utilisateur a plusieurs refresh tokens.
     * Utilisé par generateTokenPair() pour révoquer les anciens tokens.
     */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }
}
