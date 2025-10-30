<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AuthSeeder extends Seeder
{
    public function run()
    {
        // Create a test student
        Student::create([
            'student_id' => '2020-00001',
            'first_name' => 'John Murs',
            'last_name' => 'Muravils',
            'email' => 'john.doe@student.wmsu.edu.ph',
            'course' => 'BS IT',
            'year_level' => 3,
            'section' => 'A',
        ]);

        // Create a test teacher
        Teacher::create([
            'email' => 'teacher@wmsu.edu.ph',
            'password' => Hash::make('password'),
            'first_name' => 'Charles',
            'last_name' => 'Gumondas',
            'department' => 'IT',
        ]);
    }
}