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

        $identifier = $request->identifier;
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
            
            // If student login fails, try teacher login (in case it's an email without @)
            $result = $this->attemptTeacherLogin($identifier, $password, $request);
            if ($result) {
                return $result;
            }
        }

        // If all attempts fail, return error
        return back()->withErrors([
            'identifier' => 'The provided credentials do not match our records.',
            'message' => 'Invalid email/student ID or password.',
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
            Auth::guard('teacher')->login($teacher);
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
            Auth::guard('student')->login($student);
            $request->session()->regenerate();
            
            return redirect()->intended('/student/dashboard')
                ->with('message', 'Welcome back, ' . $student->first_name . '!');
        }

        return null;
    }
}

