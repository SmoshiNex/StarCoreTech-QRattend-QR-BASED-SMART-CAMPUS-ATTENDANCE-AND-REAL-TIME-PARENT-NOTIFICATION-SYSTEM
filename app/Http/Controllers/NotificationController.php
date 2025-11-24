<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get notifications for teacher
     */
    public function teacherNotifications()
    {
        $teacher = Auth::guard('teacher')->user();
        
        $notifications = NotificationLog::forTeacher($teacher->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Teacher/Notifications', [
            'notifications' => $notifications,
            'teacher' => $teacher,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = NotificationLog::findOrFail($id);
        
        // Verify ownership
        $user = Auth::guard($notification->user_type)->user();
        if ($user && $user->id == $notification->user_id) {
            $notification->markAsRead();
            return response()->json(['success' => true]);
        }
        
        return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $userType = $request->input('user_type'); // 'teacher' or 'student'
        
        if ($userType === 'teacher') {
            $userId = Auth::guard('teacher')->id();
            NotificationLog::forTeacher($userId)->unread()->update(['read_at' => now()]);
        } else {
            $userId = Auth::guard('student')->id();
            NotificationLog::forStudent($userId)->unread()->update(['read_at' => now()]);
        }
        
        return response()->json(['success' => true]);
    }
}

