<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;  // Pour hasher le mot de passe lors de la création/modification
use Illuminate\Validation\Rule;       // Pour les règles de validation avancées (ex: unique avec exception)

class UserController extends Controller
{
    /**
     * Liste tous les utilisateurs avec filtre optionnel par rôle.
     * Réservé aux admins — GET /api/users
     * Filtre optionnel : ?role=client  ou  ?role=admin
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Si le paramètre role est présent dans l'URL, filtre les utilisateurs par rôle
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Retourne les utilisateurs triés par date de création décroissante, 15 par page
        return response()->json([
            'users' => $query->latest()->paginate(15),
        ]);
    }

    /**
     * Affiche un utilisateur avec ses locations.
     * Réservé aux admins — GET /api/users/{id}
     */
    public function show(User $user): JsonResponse
    {
        // load('locations') charge les locations de l'utilisateur en une seule requête SQL
        return response()->json([
            'user' => $user->load('locations'),
        ]);
    }

    /**
     * Crée un nouvel utilisateur (admin peut choisir le rôle).
     * Réservé aux admins — POST /api/users
     */
    public function store(Request $request): JsonResponse
    {
        // Valide et filtre les données reçues
        $data = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email', // Email unique dans la table users
            'password'       => 'required|string|min:8',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:255',
            'num_permis'     => 'nullable|string|max:50',
            'date_naissance' => 'nullable|date',
            'role'           => 'required|in:admin,client', // Seuls ces deux rôles sont autorisés
        ]);

        // Hashe le mot de passe avant de l'insérer en base
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user'    => $user,
        ], 201);
    }

    /**
     * Met à jour un utilisateur existant.
     * Réservé aux admins — PUT /api/users/{id}
     * Tous les champs sont optionnels (sometimes = seulement si présent dans la requête).
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'nom'            => 'sometimes|string|max:100',
            'prenom'         => 'sometimes|string|max:100',
            // unique:users sauf pour cet utilisateur (ignore son propre id pour éviter l'erreur)
            'email'          => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:255',
            'num_permis'     => 'nullable|string|max:50',
            'date_naissance' => 'nullable|date',
            'role'           => 'sometimes|in:admin,client',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'user'    => $user,
        ]);
    }

    /**
     * Supprime un utilisateur.
     * Réservé aux admins — DELETE /api/users/{id}
     * Un admin ne peut pas supprimer son propre compte.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Empêche l'admin de se supprimer lui-même (évite de perdre le seul compte admin)
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 409);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès.',
        ]);
    }

    /**
     * Met à jour le profil de l'utilisateur connecté.
     * Disponible pour tout utilisateur authentifié — PUT /api/auth/profile
     * Permet aussi de changer le mot de passe (avec confirmation).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        // Récupère l'utilisateur actuellement connecté via son token Bearer
        $user = $request->user();

        $data = $request->validate([
            'nom'            => 'sometimes|string|max:100',
            'prenom'         => 'sometimes|string|max:100',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:255',
            'num_permis'     => 'nullable|string|max:50',
            'date_naissance' => 'nullable|date',
            // confirmed = nécessite aussi le champ password_confirmation dans la requête
            'password'       => 'sometimes|string|min:8|confirmed',
        ]);

        // Si un nouveau mot de passe est fourni, le hasher avant de le sauvegarder
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => $user->fresh(), // fresh() recharge l'objet depuis la base pour avoir les données à jour
        ]);
    }
}
