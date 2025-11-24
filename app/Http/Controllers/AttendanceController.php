<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use App\Models\TeacherClass;
use App\Models\Student;
use App\Models\NotificationLog;
use App\Services\EmailService;
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
            'duration_minutes' => 'required|integer|min:1|max:180', // Allow up to 3 hours (180 minutes)
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
        try {
            // Update session status
            $session->update([
                'status' => 'ended',
                'ended_at' => now(),
            ]);

            // Reload session with relationships
            $session->load('teacherClass.students');

            // Get all enrolled students for this class
            $enrolledStudents = $session->teacherClass->students;
            
            // Get all students who have checked in (have attendance records)
            $checkedInStudentIds = $session->records()
                ->pluck('student_id')
                ->toArray();
            
            // Get class name for notifications
            $className = $session->teacherClass->class_name 
                ?? ($session->teacherClass->class_code && $session->teacherClass->subject_name 
                    ? $session->teacherClass->class_code . ' - ' . $session->teacherClass->subject_name
                    : ($session->teacherClass->subject_name ?? $session->teacherClass->class_code ?? 'Unknown Class'));
            
            $teacherId = $session->teacherClass->teacher_id;
            $emailService = new EmailService();
            $absentCount = 0;
            
            // Mark absent students who didn't check in
            foreach ($enrolledStudents as $student) {
                if (!in_array($student->id, $checkedInStudentIds)) {
                    try {
                        // Create absent record
                        AttendanceRecord::create([
                            'attendance_session_id' => $session->id,
                            'student_id' => $student->id,
                            'checked_in_at' => null, // No check-in time for absent students
                            'status' => 'absent',
                        ]);
                        
                        $absentCount++;
                        $studentName = $student->first_name . ' ' . $student->last_name;
                        
                        // Send email notification to parent if parent_email is set
                        if ($student->parent_email) {
                            try {
                                $emailService->sendParentNotification(
                                    $student->parent_email,
                                    $studentName,
                                    'absent',
                                    $className,
                                    null, // No check-in time for absent
                                    $student->id,
                                    $teacherId
                                );
                            } catch (\Exception $e) {
                                // Log email error but continue processing
                                \Log::error('Failed to send absent email notification: ' . $e->getMessage());
                            }
                        }
                        
                        // Log attendance notification for student
                        try {
                            NotificationLog::create([
                                'user_type' => 'student',
                                'user_id' => $student->id,
                                'type' => 'attendance',
                                'title' => 'Attendance Recorded',
                                'message' => "You have been marked as absent for {$className}.",
                                'metadata' => [
                                    'class_name' => $className,
                                    'status' => 'absent',
                                    'checked_in_at' => null,
                                ],
                                'status' => 'success',
                            ]);
                        } catch (\Exception $e) {
                            \Log::error('Failed to create student notification log: ' . $e->getMessage());
                        }
                        
                        // Log attendance notification for teacher
                        try {
                            NotificationLog::create([
                                'user_type' => 'teacher',
                                'user_id' => $teacherId,
                                'type' => 'attendance',
                                'title' => 'Student Absent',
                                'message' => "{$studentName} was marked as absent for {$className}.",
                                'metadata' => [
                                    'student_name' => $studentName,
                                    'student_id' => $student->student_id,
                                    'class_name' => $className,
                                    'status' => 'absent',
                                ],
                                'status' => 'success',
                            ]);
                        } catch (\Exception $e) {
                            \Log::error('Failed to create teacher notification log: ' . $e->getMessage());
                        }
                    } catch (\Exception $e) {
                        // Log error for this student but continue with others
                        \Log::error('Failed to mark student as absent: ' . $e->getMessage(), [
                            'student_id' => $student->id,
                            'session_id' => $session->id,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Attendance session ended' . ($absentCount > 0 ? " - {$absentCount} student(s) marked as absent" : ''),
                'absent_count' => $absentCount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to end attendance session: ' . $e->getMessage(), [
                'session_id' => $session->id,
                'error' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to end session: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get live attendance data for a session
     */
    public function getLiveAttendance(AttendanceSession $session)
    {
        // Use the timezone from config (now Asia/Manila)
        $timezone = config('app.timezone', 'Asia/Manila');
        
        // Get all enrolled students
        $enrolledStudents = $session->teacherClass->students()
            ->select('students.id', 'students.student_id', 'students.first_name', 'students.last_name')
            ->orderBy('students.last_name')
            ->get();
        
        // Get attendance records
        $attendanceRecords = $session->records()
            ->with('student:id,student_id,first_name,last_name')
            ->get()
            ->keyBy('student_id');
        
        // Combine enrolled students with their attendance status
        $allStudents = $enrolledStudents->map(function ($student) use ($attendanceRecords, $timezone) {
            $record = $attendanceRecords->get($student->id);
            
            // FIX: Only try to parse the date if the record exists AND checked_in_at is not null
            // This prevents "Absent" records (which have null checked_in_at) from showing current time
            if ($record && $record->checked_in_at) {
                $checkedInAt = Carbon::parse($record->checked_in_at)->setTimezone($timezone);
                return [
                    'id' => $student->id,
                    'student_id' => $student->student_id,
                    'student_name' => $student->first_name . ' ' . $student->last_name,
                    'checked_in_at' => $checkedInAt->format('g:i:s A'),
                    'status' => $record->status, // 'present' or 'late'
                    'has_checked_in' => true,
                ];
            } else {
                return [
                    'id' => $student->id,
                    'student_id' => $student->student_id,
                    'student_name' => $student->first_name . ' ' . $student->last_name,
                    'checked_in_at' => null,
                    // If record exists (e.g., manually marked absent), use that status, otherwise default to 'absent'
                    'status' => $record ? $record->status : 'absent',
                    'has_checked_in' => false,
                ];
            }
        });

        $totalEnrolled = $enrolledStudents->count();
        $presentCount = $allStudents->where('status', 'present')->count();
        $lateCount = $allStudents->where('status', 'late')->count();
        $absentCount = $allStudents->where('status', 'absent')->count();

        return response()->json([
            'session' => $session,
            'records' => $allStudents->values(), // All students with their status
            'stats' => [
                'total' => $totalEnrolled,
                'present' => $presentCount,
                'late' => $lateCount,
                'absent' => $absentCount,
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
                        'checked_in_at' => $existingRecord->checked_in_at 
                            ? $existingRecord->checked_in_at->setTimezone(config('app.timezone'))->format('g:i A')
                            : 'N/A',
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
                    'checked_in_at' => $existingRecord->checked_in_at 
                        ? $existingRecord->checked_in_at->setTimezone(config('app.timezone'))->format('g:i A')
                        : 'N/A',
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
                $timezone = config('app.timezone', 'Asia/Manila');
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
        // The `duration_minutes` window is always based on when the teacher started the session.
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

        // Send email notification to parent if parent_email is set
        if ($student->parent_email) {
            $emailService = new EmailService();
            $studentName = $student->first_name . ' ' . $student->last_name;
            $className = $session->teacherClass->class_name 
                ?? ($session->teacherClass->class_code && $session->teacherClass->subject_name 
                    ? $session->teacherClass->class_code . ' - ' . $session->teacherClass->subject_name
                    : ($session->teacherClass->subject_name ?? $session->teacherClass->class_code ?? 'Unknown Class'));
            $checkInTimeFormatted = $checkInTime->format('g:i A');
            $teacherId = $session->teacherClass->teacher_id;

            $emailService->sendParentNotification(
                $student->parent_email,
                $studentName,
                $status,
                $className,
                $checkInTimeFormatted,
                $student->id,
                $teacherId
            );
        }

        // Get class name for notifications
        $className = $session->teacherClass->class_name 
            ?? ($session->teacherClass->class_code && $session->teacherClass->subject_name 
                ? $session->teacherClass->class_code . ' - ' . $session->teacherClass->subject_name
                : ($session->teacherClass->subject_name ?? $session->teacherClass->class_code ?? 'Unknown Class'));

        // Log attendance notification for student
        NotificationLog::create([
            'user_type' => 'student',
            'user_id' => $student->id,
            'type' => 'attendance',
            'title' => 'Attendance Recorded',
            'message' => "You have been marked as {$status} for {$className}.",
            'metadata' => [
                'class_name' => $className,
                'status' => $status,
                'checked_in_at' => $checkInTime->toDateTimeString(),
            ],
            'status' => 'success',
        ]);

        // Log attendance notification for teacher
        NotificationLog::create([
            'user_type' => 'teacher',
            'user_id' => $session->teacherClass->teacher_id,
            'type' => 'attendance',
            'title' => 'Student Checked In',
            'message' => "{$student->first_name} {$student->last_name} has checked in as {$status}.",
            'metadata' => [
                'student_name' => $student->first_name . ' ' . $student->last_name,
                'student_id' => $student->student_id,
                'class_name' => $className,
                'status' => $status,
                'checked_in_at' => $checkInTime->toDateTimeString(),
            ],
            'status' => 'success',
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
                    'checked_in_at_formatted' => $record->checked_in_at->setTimezone(config('app.timezone', 'Asia/Manila'))->format('g:i:s A'),
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