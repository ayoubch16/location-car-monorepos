<?php

namespace App\Controllers;

use App\Models\User;
use App\Views\UserView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        return response()->json([
            'users' => UserView::collection($query->latest()->paginate(15)),
        ]);
    }

    public function show($id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'user' => UserView::make($user->load('locations')),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:255',
            'num_permis'     => 'nullable|string|max:50',
            'date_naissance' => 'nullable|date',
            'role'           => 'required|in:admin,client',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'user'    => UserView::make($user),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'nom'            => 'sometimes|string|max:100',
            'prenom'         => 'sometimes|string|max:100',
            'email'          => 'sometimes|email|unique:users,email,' . $id,
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:255',
            'num_permis'     => 'nullable|string|max:50',
            'date_naissance' => 'nullable|date',
            'role'           => 'sometimes|in:admin,client',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'user'    => UserView::make($user),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 409);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'nom'            => 'sometimes|string|max:100',
            'prenom'         => 'sometimes|string|max:100',
            'telephone'      => 'nullable|string|max:20',
            'adresse'        => 'nullable|string|max:255',
            'num_permis'     => 'nullable|string|max:50',
            'date_naissance' => 'nullable|date',
            'password'       => 'sometimes|string|min:8|confirmed',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => UserView::make($user->fresh()),
        ]);
    }
}
