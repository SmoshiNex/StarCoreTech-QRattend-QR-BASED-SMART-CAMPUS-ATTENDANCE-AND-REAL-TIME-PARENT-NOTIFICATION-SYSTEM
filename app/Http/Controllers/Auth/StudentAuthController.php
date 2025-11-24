<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'student_id' => 'required|string|exists:students,student_id',
            'password' => 'required|string',
        ]);

        $student = Student::where('student_id', $request->student_id)->first();

        if (!$student || !password_verify($request->password, $student->password)) {
            return back()->withErrors([
                'student_id' => 'Invalid credentials.',
            ]);
        }

        Auth::guard('student')->login($student);

        return redirect()->intended('/student/dashboard')->with('message', 'Welcome back, ' . $student->first_name . '!');
    }

    public function dashboard()
    {
        $student = Auth::guard('student')->user();
        $enrolledClasses = $student->classes()->count();
        
        // Calculate accurate attendance rate
        $attendanceRate = $this->calculateAttendanceRate($student);
        
        return Inertia::render('Student/Dashboard', [
            'student' => $student,
            'enrolledClasses' => $enrolledClasses,
            'attendanceRate' => $attendanceRate
        ]);
    }

    /**
     * Calculate the student's attendance rate
     * 
     * @param Student $student
     * @return int Percentage (0-100)
     */
    private function calculateAttendanceRate(Student $student): int
    {
        // Get all classes the student is enrolled in
        $enrolledClassIds = $student->classes()->pluck('teacher_classes.id');
        
        if ($enrolledClassIds->isEmpty()) {
            return 0; // No classes enrolled, attendance rate is 0
        }
        
        // Get all attendance sessions for the student's enrolled classes
        // Only count sessions that have ended (to get accurate attendance rate)
        $totalSessions = AttendanceSession::whereIn('teacher_class_id', $enrolledClassIds)
            ->where('status', 'ended')
            ->count();
        
        if ($totalSessions === 0) {
            return 100; // No sessions yet, show 100% (or could show 0%, but 100% is more positive)
        }
        
        // Get all attendance records for this student (present or late)
        // Only count records from ended sessions
        // Use groupBy to get unique session IDs, then count them
        $attendedSessions = AttendanceRecord::where('student_id', $student->id)
            ->whereHas('session', function ($query) use ($enrolledClassIds) {
                $query->whereIn('teacher_class_id', $enrolledClassIds)
                      ->where('status', 'ended');
            })
            ->whereIn('status', ['present', 'late'])
            ->select('attendance_session_id')
            ->groupBy('attendance_session_id')
            ->get()
            ->count();
        
        // Calculate percentage: (attended sessions / total sessions) * 100
        $rate = ($attendedSessions / $totalSessions) * 100;
        
        // Round to nearest integer
        return (int) round($rate);
    }

    public function logout(Request $request)
    {
        Auth::guard('student')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/');
    }
}