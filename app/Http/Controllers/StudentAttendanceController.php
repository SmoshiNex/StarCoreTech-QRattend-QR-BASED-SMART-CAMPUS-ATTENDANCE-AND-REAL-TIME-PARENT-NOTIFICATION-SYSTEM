<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class StudentAttendanceController extends Controller
{
    /**
     * Get attendance history for the logged-in student
     */
    public function history(Request $request)
    {
        $student = Auth::guard('student')->user();
        
        $records = AttendanceRecord::where('student_id', $student->id)
            ->with(['session.teacherClass.teacher', 'session.teacherClass'])
            ->orderBy('checked_in_at', 'desc')
            ->paginate(20);

        $records->getCollection()->transform(function ($record) {
            return [
                'id' => $record->id,
                'class_name' => $record->session->teacherClass->class_name 
                    ?? ($record->session->teacherClass->class_code && $record->session->teacherClass->subject_name 
                        ? $record->session->teacherClass->class_code . ' - ' . $record->session->teacherClass->subject_name
                        : ($record->session->teacherClass->subject_name ?? $record->session->teacherClass->class_code ?? 'Unknown Class')),
                'subject_name' => $record->session->teacherClass->subject_name ?? '',
                'class_code' => $record->session->teacherClass->class_code ?? '',
                'teacher_name' => $record->session->teacherClass->teacher 
                    ? $record->session->teacherClass->teacher->first_name . ' ' . $record->session->teacherClass->teacher->last_name
                    : 'Unknown Teacher',
                'checked_in_at' => $record->checked_in_at ? $record->checked_in_at->format('Y-m-d H:i:s') : null,
                'checked_in_at_formatted' => $record->checked_in_at ? $record->checked_in_at->format('M d, Y g:i A') : 'N/A',
                'status' => $record->status,
                'date' => $record->checked_in_at ? $record->checked_in_at->format('Y-m-d') : null,
            ];
        });

        return Inertia::render('Student/AttendanceHistory', [
            'records' => $records,
            'student' => $student,
        ]);
    }
}

