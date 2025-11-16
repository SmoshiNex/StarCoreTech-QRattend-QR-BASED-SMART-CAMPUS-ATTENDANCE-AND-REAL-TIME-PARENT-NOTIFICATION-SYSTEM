<?php

namespace App\Http\Controllers;

use App\Models\TeacherClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentClassController extends Controller
{
    public function showRegistration($classId)
    {
        $class = TeacherClass::with('teacher')->findOrFail($classId);
        
        return Inertia::render('Student/RegisterClass', [
            'class' => $class,
            'auth' => [
                'student' => Auth::guard('student')->user()
            ]
        ]);
    }

    public function register(Request $request, $classId)
    {
        $class = TeacherClass::findOrFail($classId);
        $student = Auth::guard('student')->user();

        // If student is not logged in, create account first
        if (!$student) {
            $validated = $request->validate([
                'student_id' => 'required|string|unique:students,student_id',
                'full_name' => 'required|string|max:255',
                'parent_email' => 'required|email|max:255',
                'password' => 'required|string|min:8',
            ]);

            // Parse full name
            $nameParts = explode(' ', $validated['full_name'], 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';

            // Create student account
            $student = Student::create([
                'student_id' => $validated['student_id'],
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $validated['parent_email'], // Store parent email
                'password' => bcrypt($validated['password']),
            ]);

            // Log the student in
            Auth::guard('student')->login($student);
        }

        // Check if already registered
        if ($class->students()->where('class_student.student_id', $student->id)->exists()) {
            return redirect()->back()->with('error', 'You are already registered for this class');
        }

        // Register student to class
        $class->students()->attach($student->id);

        return redirect()->route('student.dashboard')->with('success', 'Successfully registered for ' . $class->class_code);
    }

    public function myClasses()
    {
        $student = Auth::guard('student')->user();
        $classes = $student->classes()->with('teacher')->get();

        return Inertia::render('Student/MyClasses', [
            'classes' => $classes
        ]);
    }
}