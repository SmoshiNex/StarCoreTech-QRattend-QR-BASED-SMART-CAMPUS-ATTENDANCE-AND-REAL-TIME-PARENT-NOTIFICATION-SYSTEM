<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\TeacherClass;
use App\Services\AttendanceReportExporter;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportsController extends Controller
{
    /**
     * Display attendance reports dashboard + The database inside of that Reports Table will disappear also when you delete a class where they scannned from My Class.
     */
    public function index(Request $request)
    {
        $teacher = auth('teacher')->user();
        $classId = $request->input('class_id') ?: null;
        $date = $request->input('date') ?: null;

        $classes = $this->getTeacherClasses($teacher);
        $records = $this->getAttendanceRecords($teacher, $classId, $date);

        return inertia('Teacher/Reports/Index', [
            'records' => $records,
            'classes' => $classes,
            'filters' => [
                'class_id' => $classId,
                'date' => $date,
            ],
        ]);
    }
    
    /**
     * Export attendance report to CSV
     */
    public function export(Request $request, AttendanceReportExporter $exporter)
    {
        $request->validate([
            'class_id' => 'nullable|exists:teacher_classes,id',
            'date' => 'nullable|date',
            'format' => 'required|in:csv,xlsx',
        ]);
        
        $teacher = auth('teacher')->user();
        $classId = $this->normalizeClassId($request->get('class_id'));
        $date = $this->normalizeDate($request->get('date'));
        $format = $request->get('format');
        
        $records = $this->getAttendanceRecordsForExport($teacher, $classId, $date);
        $exportData = $exporter->buildExportData($records);
        $filename = $exporter->generateFilename($classId, $date);
        
        return $exporter->export($format, $exportData, $filename);
    }
    
    /**
     * Get teacher classes for filter dropdown
     */
    private function getTeacherClasses($teacher)
    {
        $query = TeacherClass::query()
            ->select('id', 'class_name', 'class_code', 'subject_name')
            ->orderBy('class_name');

        if ($teacher) {
            $query->where('teacher_id', $teacher->id);
        }

        return $query->get();
    }
    
    /**
     * Get attendance records for display
     */
    private function getAttendanceRecords($teacher, $classId, $date)
    {
        $query = AttendanceRecord::query()
            ->with([
                'student:id,student_id,first_name,last_name',
                'session:id,teacher_class_id,started_at',
                'session.teacherClass:id,class_name,class_code,subject_name'
            ])
            ->latest('checked_in_at');

        if ($teacher) {
            $query->whereHas('session.teacherClass', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->id);
            });
        }

        if ($classId) {
            $query->whereHas('session', function ($query) use ($classId) {
                $query->where('teacher_class_id', $classId);
            });
        }

        if ($date) {
            try {
                $parsedDate = Carbon::parse($date)->format('Y-m-d');
                $query->whereDate('checked_in_at', $parsedDate);
            } catch (\Exception $e) {
                // If date parsing fails, skip date filter
            }
        }

        return $query->get()->map(function ($record) {
            $checkedInAt = $record->checked_in_at 
                ? $record->checked_in_at->toIso8601String() 
                : null;

            
            // Late records are normalized to 'present' because we do not have yet a feature for that so the UI stays simple and consistent.
            $normalizedStatus = $record->status === 'late' ? 'present' : $record->status;
            
            return [
                'id' => $record->id,
                'status' => $normalizedStatus,
                'checked_in_at' => $checkedInAt,
                'student' => $record->student ? [
                    'id' => $record->student->id,
                    'student_id' => $record->student->student_id,
                    'first_name' => $record->student->first_name,
                    'last_name' => $record->student->last_name,
                ] : null,
                'session' => $record->session ? [
                    'id' => $record->session->id,
                    'teacher_class_id' => $record->session->teacher_class_id,
                    'teacherClass' => $record->session->teacherClass ? [
                        'id' => $record->session->teacherClass->id,
                        'class_name' => $record->session->teacherClass->class_name,
                        'class_code' => $record->session->teacherClass->class_code,
                        'subject_name' => $record->session->teacherClass->subject_name,
                    ] : null,
                ] : null,
            ];
        });
    }
    
    /**
     * Get attendance records for export
     */
    private function getAttendanceRecordsForExport($teacher, $classId, $date)
    {
        $query = AttendanceRecord::query()
            ->with([
                'student:id,student_id,first_name,last_name',
                'session:id,teacher_class_id',
                'session.teacherClass:id,class_name,class_code,subject_name'
            ]);

        if ($teacher) {
            $query->whereHas('session.teacherClass', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->id);
            });
        }
            
        if ($classId) {
            $query->whereHas('session', function ($query) use ($classId) {
                $query->where('teacher_class_id', $classId);
            });
        }
        
        if ($date) {
            $query->whereDate('checked_in_at', $date);
        }
        
        return $query->orderBy('checked_in_at')->get();
    }
    
    /**
     * Normalize class ID (convert empty string to null)
     */
    private function normalizeClassId($classId)
    {
        return $classId && $classId !== '' ? $classId : null;
    }
    
    /**
     * Normalize date (parse or return null)
     */
    private function normalizeDate($date)
    {
        return $date && $date !== '' ? Carbon::parse($date) : null;
    }
}
