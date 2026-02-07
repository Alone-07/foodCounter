<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pre_orders', function (Blueprint $table) {
            $table->uuid('uuid')->primary();

            // INTEGER user id
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // UUID menu item id
            $table->uuid('menu_item_id')->nullable();

            $table->integer('quantity')->default(1);
            $table->string('status')->default('pending');

            $table->timestamps();

            // FK for menu items
            $table->foreign('menu_item_id')
                ->references('uuid')
                ->on('menu_items')
                ->cascadeOnDelete();

            // Prevent duplicate pre-orders
            $table->unique(['user_id', 'menu_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pre_orders');
    }
};

