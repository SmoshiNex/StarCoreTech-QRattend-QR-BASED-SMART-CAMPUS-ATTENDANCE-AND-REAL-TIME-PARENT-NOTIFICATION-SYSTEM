<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use App\Mail\StudentPasswordResetNotification;

class StudentPasswordResetController extends Controller
{
    public function showResetForm()
    {
        return inertia('Auth/StudentPasswordReset');
    }

    public function reset(Request $request)
    {
        $request->validate([
            'student_id' => [
                'required',
                'string',
                'exists:students,student_id'
            ],
            'parent_email' => [
                'required',
                'email',
                function ($attribute, $value, $fail) use ($request) {
                    $student = Student::where('student_id', $request->student_id)->first();
                    if ($student && $student->parent_email !== $value) {
                        $fail('The parent email does not match our records.');
                    }
                }
            ],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'student_id.required' => 'Student ID is required.',
            'student_id.exists' => 'This student ID is not registered in our system.',
            'parent_email.required' => 'Parent email is required.',
            'parent_email.email' => 'Please enter a valid email address.',
            'password.required' => 'New password is required.',
            'password.confirmed' => 'Password confirmation does not match.',
            'password.min' => 'Password must be at least 8 characters.',
        ]);

        $student = Student::where('student_id', $request->student_id)->first();

        if (!$student) {
            return back()->withErrors([
                'student_id' => 'We could not find a student with that ID.',
            ]);
        }

        $student->password = Hash::make($request->password);
        $student->save();

        // Send notification email to parent
        try {
            Mail::to($student->parent_email)->send(new StudentPasswordResetNotification($student));
        } catch (\Exception $e) {
            // Log the error but don't fail the password reset
            \Log::error('Failed to send student password reset notification: ' . $e->getMessage());
        }

        return redirect('/')
            ->with('status', 'Your password has been reset successfully. A notification has been sent to your parent.');
    }
}