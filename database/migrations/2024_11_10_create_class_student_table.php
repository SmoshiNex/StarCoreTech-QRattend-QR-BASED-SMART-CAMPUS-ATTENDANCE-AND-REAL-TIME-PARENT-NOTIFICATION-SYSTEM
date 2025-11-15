<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('class_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->timestamps();

            // Prevent duplicate enrollments
            $table->unique(['teacher_class_id', 'student_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('class_student');
    }
};