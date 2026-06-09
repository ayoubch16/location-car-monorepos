<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@location-voiture.com'],
            [
                'nom'      => 'Admin',
                'prenom'   => 'Super',
                'email'    => 'admin@location-voiture.com',
                'password' => Hash::make('Admin@1234'),
                'role'     => 'admin',
            ]
        );

        $this->command->info('Admin créé: admin@location-voiture.com / Admin@1234');
    }
}
