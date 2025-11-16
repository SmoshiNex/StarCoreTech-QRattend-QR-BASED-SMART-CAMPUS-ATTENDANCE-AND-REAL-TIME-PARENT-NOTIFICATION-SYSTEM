<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        Student::create([
            'student_id' => '2021-00001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@student.com',
            'course' => 'BSIT',
            'year_level' => '3rd Year',
            'section' => 'A',
            'password' => Hash::make('password123'),
        ]);

        Student::create([
            'student_id' => '2021-00013',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@student.wmsu.edu.ph',
            'course' => 'BS IT',
            'year_level' => '3rd Year',
            'section' => 'A',
            'password' => Hash::make('password123'),
        ]);

        Student::create([
            'student_id' => '2021-00014',
            'first_name' => 'Michael',
            'last_name' => 'Johnson',
            'email' => 'michael.j@student.wmsu.edu.ph',
            'course' => 'BS IT',
            'year_level' => '3rd Year',
            'section' => 'A',
            'password' => Hash::make('password123'),
        ]);
    }
    
    
}