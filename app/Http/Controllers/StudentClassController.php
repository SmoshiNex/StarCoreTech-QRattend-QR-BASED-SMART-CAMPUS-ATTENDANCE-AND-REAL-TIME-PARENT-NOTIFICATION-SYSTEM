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
                'email' => $validated['student_id'] . '@student.local', // Use student_id as email placeholder
                'parent_email' => $validated['parent_email'], // Store parent email separately
                'course' => 'N/A', // Default value
                'year_level' => 1, // Default value
                'section' => 'N/A', // Default value
                'password' => bcrypt($validated['password']),
            ]);

            // Register student to class FIRST before logging in
            $class->students()->attach($student->id);

            // Log the student in with remember token
            Auth::guard('student')->login($student, true);
            
            // Regenerate session to prevent session fixation
            $request->session()->regenerate();

            // If this registration was triggered by scanning a QR code, redirect
            // back to the attendance scan route so the student is actually marked present/late.
            $attendanceSessionId = $request->session()->pull('attendance_session_id');
            if ($attendanceSessionId) {
                return redirect()->route('attendance.scan', $attendanceSessionId);
            }

            return redirect()->route('student.dashboard')->with('success', 'Successfully registered for ' . $class->class_code);
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
            'classes' => $classes,
            'student' => $student,
        ]);
    }

    public function attendanceHistory()
    {
        $student = Auth::guard('student')->user();
        
        $records = \App\Models\AttendanceRecord::where('student_id', $student->id)
            ->with(['session.teacherClass.teacher'])
            ->orderBy('checked_in_at', 'desc')
            ->paginate(20)
            ->through(function ($record) {
                return [
                    'id' => $record->id,
                    'class_name' => $record->session->teacherClass->class_name 
                        ?? ($record->session->teacherClass->class_code && $record->session->teacherClass->subject_name 
                            ? $record->session->teacherClass->class_code . ' - ' . $record->session->teacherClass->subject_name
                            : ($record->session->teacherClass->subject_name ?? $record->session->teacherClass->class_code ?? 'Unknown Class')),
                    'subject_name' => $record->session->teacherClass->subject_name ?? '',
                    'teacher_name' => $record->session->teacherClass->teacher 
                        ? $record->session->teacherClass->teacher->first_name . ' ' . $record->session->teacherClass->teacher->last_name
                        : 'Unknown Teacher',
                    'checked_in_at' => $record->checked_in_at ? $record->checked_in_at->format('Y-m-d H:i:s') : null,
                    'checked_in_at_formatted' => $record->checked_in_at ? $record->checked_in_at->format('M d, Y g:i A') : 'N/A',
                    'status' => $record->status,
                ];
            });

        return Inertia::render('Student/AttendanceHistory', [
            'records' => $records,
            'student' => $student,
        ]);
    }

    public function notifications()
    {
        $student = Auth::guard('student')->user();
        
        $notifications = \App\Models\NotificationLog::forStudent($student->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Student/Notifications', [
            'notifications' => $notifications,
            'student' => $student,
        ]);
    }
}