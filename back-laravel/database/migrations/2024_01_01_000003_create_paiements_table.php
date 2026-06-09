<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
            $table->decimal('montant', 10, 2);
            $table->timestamp('date_paiement')->nullable();
            $table->enum('methode', ['carte_bancaire', 'especes', 'virement'])->default('carte_bancaire');
            $table->enum('statut', ['en_attente', 'paye', 'rembourse', 'annule'])->default('en_attente');
            $table->string('reference_transaction')->nullable()->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
