<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class TeacherPasswordResetController extends Controller
{
    public function showResetForm()
    {
        return inertia('Auth/TeacherPasswordReset');
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email' => [
                'required',
                'email',
                'regex:/^[a-zA-Z0-9._%+-]+@wmsu\.edu\.ph$/',
                'exists:teachers,email'
            ],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.regex' => 'Please enter a valid WMSU email address (@wmsu.edu.ph).',
            'email.exists' => 'This email is not registered in our system.',
            'password.required' => 'New password is required.',
            'password.confirmed' => 'Password confirmation does not match.',
            'password.min' => 'Password must be at least 8 characters.',
        ]);

        $teacher = Teacher::where('email', $request->email)->first();

        if (!$teacher) {
            return back()->withErrors([
                'email' => 'We could not find a teacher with that email address.',
            ]);
        }

        $teacher->password = Hash::make($request->password);
        $teacher->save();

        return redirect()->route('teacher.login')
            ->with('status', 'Your password has been reset successfully.');
    }
}