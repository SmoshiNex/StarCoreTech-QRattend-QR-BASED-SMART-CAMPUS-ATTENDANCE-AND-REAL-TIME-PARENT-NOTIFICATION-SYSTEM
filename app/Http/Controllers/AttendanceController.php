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
        // Session lasts for the entire class duration (3 hours max)
        // QR code remains valid until ends_at, allowing multiple students to scan
        $endsAt = $startedAt->copy()->addHours(3);

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
        $timezone = config('app.timezone', 'UTC');
        
        $records = $session->records()
            ->with('student:id,student_id,first_name,last_name')
            ->orderBy('checked_in_at', 'asc')
            ->get()
            ->map(function ($record) use ($timezone) {
                // Convert to app timezone before formatting to ensure correct time display
                $checkedInAt = Carbon::parse($record->checked_in_at)
                    ->setTimezone($timezone);

                // For now, treat 'late' the same as 'present' in the live view.
                // This keeps the UI simple until separate LATE/ABSENT flows are implemented.
                $normalizedStatus = $record->status === 'late' ? 'present' : $record->status;
                
                return [
                    'id' => $record->id,
                    'student_id' => $record->student->student_id,
                    'student_name' => $record->student->first_name . ' ' . $record->student->last_name,
                    'checked_in_at' => $checkedInAt->format('g:i:s A'),
                    'status' => $normalizedStatus,
                ];
            });

        $totalEnrolled = $session->teacherClass->students()->count();
        $presentCount = $records->where('status', 'present')->count();
        // We are not surfacing LATE yet in the UI; treat them as PRESENT for counts as well.
        $lateCount = 0;

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
        $session = AttendanceSession::with('teacherClass')->findOrFail($sessionId);

        // Check if session is still active
        if (!$session->isActive()) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'This attendance session has ended',
                ], 400);
            }
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
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Please log in to check in',
                ], 401);
            }
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
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'You have already checked in for this session',
                    'class' => [
                        'class_name' => $session->teacherClass->class_name 
                            ?? ($session->teacherClass->class_code && $session->teacherClass->subject_name 
                                ? $session->teacherClass->class_code . ' - ' . $session->teacherClass->subject_name
                                : ($session->teacherClass->subject_name ?? $session->teacherClass->class_code ?? 'Unknown Class')),
                        'subject_name' => $session->teacherClass->subject_name ?? '',
                        'class_code' => $session->teacherClass->class_code ?? '',
                    ],
                    'record' => [
                        'checked_in_at' => $existingRecord->checked_in_at->format('g:i A'),
                        'status' => $existingRecord->status,
                    ],
                ], 400);
            }
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

        // Get client time if provided (phone's local time), otherwise use server time
        $clientTime = $request->header('X-Client-Time');
        $checkInTime = now();
        
        if ($clientTime) {
            try {
                // Parse the local time string from client (format: YYYY-MM-DDTHH:mm:ss)
                // Treat it as being in the app's timezone so the displayed time matches the phone
                $timezone = config('app.timezone', 'UTC');
                $parsedClientTime = Carbon::parse($clientTime, $timezone);

                // Basic sanity check – if the phone time is more than 1 hour in the future,
                // fall back to server time to avoid obviously invalid data
                $serverTime = now();
                if ($parsedClientTime->isFuture() && $parsedClientTime->diffInHours($serverTime) > 1) {
                    $checkInTime = $serverTime;
                } else {
                    $checkInTime = $parsedClientTime;
                }
            } catch (\Exception $e) {
                // If parsing fails, use server time
                $checkInTime = now();
            }
        }

        // Determine if student is present or late.
        //
        // IMPORTANT:
        // - We only use the server timestamps to decide PRESENT vs LATE.
        // - This avoids any mismatch between the phone clock and the server clock.
        // - The `duration_minutes` window is always based on when the teacher started the session.
        $startedAt = Carbon::parse($session->started_at);
        $allowedTime = $startedAt->copy()->addMinutes($session->duration_minutes);

        $now = now();
        $status = $now->lte($allowedTime) ? 'present' : 'late';

        // Create attendance record - use validated time
        $record = AttendanceRecord::create([
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
            'checked_in_at' => $checkInTime,
            'status' => $status,
        ]);

        // Return JSON for API calls, Inertia for direct page visits
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'status' => $status,
                'message' => $status === 'present' 
                    ? 'You are marked PRESENT' 
                    : 'You checked in after the allowed time',
                'class' => [
                    'class_name' => $session->teacherClass->class_name 
                        ?? ($session->teacherClass->class_code && $session->teacherClass->subject_name 
                            ? $session->teacherClass->class_code . ' - ' . $session->teacherClass->subject_name
                            : ($session->teacherClass->subject_name ?? $session->teacherClass->class_code ?? 'Unknown Class')),
                    'subject_name' => $session->teacherClass->subject_name ?? '',
                    'class_code' => $session->teacherClass->class_code ?? '',
                ],
                'record' => [
                    'checked_in_at' => $record->checked_in_at->format('H:i:s'),
                    'checked_in_at_formatted' => $record->checked_in_at->setTimezone(config('app.timezone', 'UTC'))->format('g:i:s A'),
                    'status' => $record->status,
                ],
                'student' => [
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'student_id' => $student->student_id,
                ],
            ]);
        }

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
