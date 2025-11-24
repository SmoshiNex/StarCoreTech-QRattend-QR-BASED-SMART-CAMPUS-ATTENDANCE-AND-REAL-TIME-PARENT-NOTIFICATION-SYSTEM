<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('user_type', ['teacher', 'student'])->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('type')->index(); // 'attendance', 'email_sent', 'email_failed', etc.
            $table->string('title');
            $table->text('message');
            $table->json('metadata')->nullable(); // Store additional data like class name, student name, etc.
            $table->enum('status', ['success', 'failed', 'pending'])->default('success');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Index for efficient queries
            $table->index(['user_type', 'user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};

