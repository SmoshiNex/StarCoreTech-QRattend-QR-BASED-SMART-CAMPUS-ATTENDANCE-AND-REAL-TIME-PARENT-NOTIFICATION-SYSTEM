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
        
        // Get all teacher's classes with students and today's attendance sessions
        $classes = $teacher->classes()
            ->with(['students', 'attendanceSessions' => function($query) {
                $query->whereDate('started_at', today())
                      ->with('records');
            }])
            ->get();

        // Calculate statistics
        $totalStudents = $classes->sum(function($class) {
            return $class->students->count();
        });

        // Get today's attendance data - count only classes that had sessions today
        $todaySessions = $classes->flatMap->attendanceSessions;
        $classesToday = $classes->filter(function($class) {
            return $class->attendanceSessions->count() > 0;
        })->count();
        
        // Calculate present and absent counts
        $presentToday = 0;
        $absentToday = 0;
        
        foreach ($classes as $class) {
            $todaySessionForClass = $class->attendanceSessions->first();
            if ($todaySessionForClass) {
                $presentToday += $todaySessionForClass->records->count();
                $absentToday += ($class->students->count() - $todaySessionForClass->records->count());
            }
        }

        // Format classes for display
        $formattedClasses = $classes->map(function($class) {
            $todaySession = $class->attendanceSessions->first();
            $totalStudents = $class->students->count();
            $present = $todaySession ? $todaySession->records->count() : 0;
            $absent = $totalStudents - $present;
            
            // Calculate the actual end time based on duration_minutes
            $timeDisplay = 'No session today';
            $status = null;
            if ($todaySession) {
                $endTime = $todaySession->started_at->copy()->addMinutes($todaySession->duration_minutes);
                $timeDisplay = $todaySession->started_at->format('g:i A') . ' - ' . $endTime->format('g:i A');
                $status = $todaySession->status; // 'active' or 'ended'
            }
            
            return [
                'id' => $class->id,
                'code' => $class->class_code,
                'name' => $class->subject_name,
                'time' => $timeDisplay,
                'status' => $status,
                'total' => $totalStudents,
                'present' => $present,
                'absent' => $absent,
            ];
        });

        $stats = [
            'classesToday' => $classesToday,
            'totalStudents' => $totalStudents,
            'presentToday' => $presentToday,
            'absentToday' => $absentToday,
            'classes' => $formattedClasses,
        ];
        
        return Inertia::render('Teacher/Dashboard', [
            'teacher' => $teacher,
            'stats' => $stats,
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