<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UnifiedAuthController extends Controller
{
    /**
     * Handle unified login for both teachers and students
     */
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        // Trim whitespace which is common on mobile phones
        $identifier = trim($request->identifier);
        $password = $request->password;

        // Determine if identifier is an email (teacher) or student_id (student)
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL) !== false;

        if ($isEmail) {
            // Try teacher login first
            $result = $this->attemptTeacherLogin($identifier, $password, $request);
            if ($result) {
                return $result;
            }
        } else {
            // Try student login first
            $result = $this->attemptStudentLogin($identifier, $password, $request);
            if ($result) {
                return $result;
            }
            
            // If student login fails, try teacher login (fallback)
            $result = $this->attemptTeacherLogin($identifier, $password, $request);
            if ($result) {
                return $result;
            }
        }

        // If all attempts fail, return error
        return back()->withErrors([
            'identifier' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Attempt teacher login
     */
    private function attemptTeacherLogin($identifier, $password, $request)
    {
        // Try to find teacher by email
        $teacher = Teacher::where('email', $identifier)->first();

        if ($teacher && password_verify($password, $teacher->password)) {
            // FIX: Ensure any other sessions are cleared before logging in
            Auth::guard('student')->logout(); 
            Auth::guard('web')->logout();

            Auth::guard('teacher')->login($teacher); // Standard session login
            $request->session()->regenerate();
            
            return redirect()->intended('/teacher/dashboard')
                ->with('message', 'Welcome back, ' . $teacher->first_name . '!');
        }

        return null;
    }

    /**
     * Attempt student login
     */
    private function attemptStudentLogin($identifier, $password, $request)
    {
        // Try to find student by student_id
        $student = Student::where('student_id', $identifier)->first();

        if ($student && password_verify($password, $student->password)) {
            // FIX: Ensure any other sessions are cleared before logging in
            Auth::guard('teacher')->logout();
            Auth::guard('web')->logout();

            Auth::guard('student')->login($student); // Standard session login
            $request->session()->regenerate();
            
            return redirect()->intended('/student/dashboard')
                ->with('message', 'Welcome back, ' . $student->first_name . '!');
        }

        return null;
    }
}