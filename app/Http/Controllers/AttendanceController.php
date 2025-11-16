<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use App\Models\TeacherClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Start a new attendance session for a class
     */
    public function startSession(Request $request, TeacherClass $class)
    {
        $validated = $request->validate([
            'duration_minutes' => 'required|integer|min:1|max:60',
        ]);

        // End any active sessions for this class
        AttendanceSession::where('teacher_class_id', $class->id)
            ->where('status', 'active')
            ->update(['status' => 'ended', 'ended_at' => now()]);

        $startedAt = now();
        $endsAt = $startedAt->copy()->addHours(3); // Session lasts 3 hours max

        $session = AttendanceSession::create([
            'teacher_class_id' => $class->id,
            'duration_minutes' => $validated['duration_minutes'],
            'started_at' => $startedAt,
            'ends_at' => $endsAt,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'session' => $session,
            'message' => 'Attendance session started successfully',
        ]);
    }

    /**
     * End an active attendance session
     */
    public function endSession(AttendanceSession $session)
    {
        $session->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Attendance session ended',
        ]);
    }

    /**
     * Get live attendance data for a session
     */
    public function getLiveAttendance(AttendanceSession $session)
    {
        $records = $session->records()
            ->with('student:id,student_id,first_name,last_name')
            ->orderBy('checked_in_at', 'asc')
            ->get()
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'student_id' => $record->student->student_id,
                    'student_name' => $record->student->first_name . ' ' . $record->student->last_name,
                    'checked_in_at' => $record->checked_in_at->format('g:i A'),
                    'status' => $record->status,
                ];
            });

        $totalEnrolled = $session->teacherClass->students()->count();
        $presentCount = $records->where('status', 'present')->count();
        $lateCount = $records->where('status', 'late')->count();

        return response()->json([
            'session' => $session,
            'records' => $records,
            'stats' => [
                'total' => $totalEnrolled,
                'present' => $presentCount,
                'late' => $lateCount,
            ],
        ]);
    }

    /**
     * Student scans QR code to check in
     */
    public function scanQR(Request $request, $sessionId)
    {
        $session = AttendanceSession::findOrFail($sessionId);

        // Check if session is still active
        if (!$session->isActive()) {
            return Inertia::render('Student/AttendanceResult', [
                'success' => false,
                'status' => 'error',
                'message' => 'This attendance session has ended',
                'class' => $session->teacherClass,
            ]);
        }

        $student = Auth::guard('student')->user();

        // If student is not logged in, redirect to registration
        if (!$student) {
            return redirect()->route('student.classes.show', $session->teacherClass->id)
                ->with('attendance_session_id', $sessionId);
        }

        // Check if student is enrolled in the class
        if (!$session->teacherClass->students()->where('students.id', $student->id)->exists()) {
            // Auto-register student in the class
            $session->teacherClass->students()->attach($student->id);
        }

        // Check if student already checked in
        $existingRecord = AttendanceRecord::where('attendance_session_id', $session->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existingRecord) {
            return Inertia::render('Student/AttendanceResult', [
                'success' => false,
                'status' => 'error',
                'message' => 'You have already checked in for this session',
                'class' => $session->teacherClass,
                'record' => [
                    'checked_in_at' => $existingRecord->checked_in_at->format('g:i A'),
                    'status' => $existingRecord->status,
                ],
            ]);
        }

        // Determine if student is present or late
        $status = $session->isTimeForPresent() ? 'present' : 'late';

        // Create attendance record
        $record = AttendanceRecord::create([
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
            'checked_in_at' => now(),
            'status' => $status,
        ]);

        return Inertia::render('Student/AttendanceResult', [
            'success' => true,
            'status' => $status,
            'message' => $status === 'present' 
                ? 'You are marked PRESENT' 
                : 'You checked in after the allowed time',
            'class' => $session->teacherClass,
            'record' => [
                'checked_in_at' => $record->checked_in_at->format('g:i A'),
                'status' => $record->status,
            ],
        ]);
    }
}
