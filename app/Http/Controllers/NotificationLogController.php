<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationLogController extends Controller
{
    /**
     * Get notification logs for teacher
     */
    public function teacherIndex(Request $request)
    {
        $teacher = Auth::guard('teacher')->user();
        
        $notifications = NotificationLog::forTeacher($teacher->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Teacher/NotificationLog', [
            'notifications' => $notifications,
            'userType' => 'teacher',
        ]);
    }

    /**
     * Get notification logs for student
     */
    public function studentIndex(Request $request)
    {
        $student = Auth::guard('student')->user();
        
        $notifications = NotificationLog::forStudent($student->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Student/NotificationLog', [
            'notifications' => $notifications,
            'userType' => 'student',
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $userType = $request->input('user_type');
        $userId = $userType === 'teacher' 
            ? Auth::guard('teacher')->id() 
            : Auth::guard('student')->id();

        $notification = NotificationLog::where('id', $id)
            ->where('user_type', $userType)
            ->where('user_id', $userId)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $userType = $request->input('user_type');
        $userId = $userType === 'teacher' 
            ? Auth::guard('teacher')->id() 
            : Auth::guard('student')->id();

        NotificationLog::where('user_type', $userType)
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}

