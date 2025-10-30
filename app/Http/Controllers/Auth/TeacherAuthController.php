<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TeacherAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('teacher')->attempt($request->only('email', 'password'))) {
            $request->session()->regenerate();
            
            $teacher = Auth::guard('teacher')->user();
            return redirect()->intended('/teacher/dashboard')
                ->with('message', 'Welcome back, ' . $teacher->first_name . '!');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function dashboard()
    {
        $teacher = Auth::guard('teacher')->user();
        
        return Inertia::render('Teacher/Dashboard', [
            'teacher' => $teacher
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('teacher')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/');
    }
}