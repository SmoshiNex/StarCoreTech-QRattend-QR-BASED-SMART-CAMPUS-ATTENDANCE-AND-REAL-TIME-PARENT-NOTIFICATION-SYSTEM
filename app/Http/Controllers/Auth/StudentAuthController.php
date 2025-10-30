<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'student_id' => 'required|string|exists:students,student_id',
        ]);

        $student = Student::where('student_id', $request->student_id)->first();

        if (!$student) {
            return back()->withErrors([
                'student_id' => 'Student ID not found.',
            ]);
        }

        Auth::guard('student')->login($student);

        return redirect()->intended('/student/dashboard')->with('message', 'Welcome back, ' . $student->first_name . '!');
    }

    public function dashboard()
    {
        $student = Auth::guard('student')->user();
        
        return Inertia::render('Student/Dashboard', [
            'student' => $student
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('student')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/');
    }
}