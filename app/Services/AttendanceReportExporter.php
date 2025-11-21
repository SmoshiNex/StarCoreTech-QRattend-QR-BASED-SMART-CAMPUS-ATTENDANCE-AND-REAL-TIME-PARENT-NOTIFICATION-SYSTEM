<?php

namespace App\Services;

use App\Models\TeacherClass;
use Illuminate\Support\Carbon;

class AttendanceReportExporter
{
    protected string $timezone;

    public function __construct()
    {
        $this->timezone = config('app.timezone', 'UTC');
    }

    /**
     * Prepare rows for export.
     */
    public function buildExportData($records): array
    {
        $exportData = [];

        foreach ($records as $record) {
            $exportData[] = [
                'Student Name' => $this->formatStudentName($record),
                'Student ID' => $this->formatStudentId($record),
                'Class' => $this->formatClassName($record),
                'Date' => $this->formatDateForExport($record),
                'Status' => ucfirst($record->status ?? 'present'),
            ];
        }

        return $exportData;
    }

    /**
     * Generate filename for export.
     */
    public function generateFilename(?string $classId, $date): string
    {
        $filenameClassName = 'All_Classes';

        if ($classId) {
            $class = TeacherClass::select('class_name', 'class_code', 'subject_name')->find($classId);
            $filenameClassName = $class?->class_name
                ?? $class?->subject_name
                ?? $class?->class_code
                ?? 'All_Classes';

            $filenameClassName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $filenameClassName);
            $filenameClassName = preg_replace('/\s+/', '_', $filenameClassName);
        }

        $dateStr = $date
            ? $date->format('m-d-Y')
            : 'All_Dates';

        return "{$filenameClassName}_{$dateStr}";
    }

    /**
     * Stream the export in the requested format.
     */
    public function export(string $format, array $data, string $filename)
    {
        if ($format === 'csv') {
            return $this->exportCsv($data, $filename);
        }

        // Placeholder: default to CSV until Excel export is implemented.
        return $this->exportCsv($data, $filename);
    }

    protected function formatStudentName($record): string
    {
        if (!$record->student) {
            return 'Unknown Student';
        }

        $firstName = trim($record->student->first_name ?? '');
        $lastName = trim($record->student->last_name ?? '');
        $fullName = trim($firstName . ' ' . $lastName);

        return $fullName ?: 'Unknown Student';
    }

    protected function formatStudentId($record): string
    {
        return $record->student->student_id ?? '—';
    }

    protected function formatClassName($record): string
    {
        if (!$record->session || !$record->session->teacherClass) {
            return 'Unknown Class';
        }

        $teacherClass = $record->session->teacherClass;

        if ($teacherClass->class_name) {
            return $teacherClass->class_name;
        }

        if ($teacherClass->class_code && $teacherClass->subject_name) {
            return $teacherClass->class_code . ' - ' . $teacherClass->subject_name;
        }

        return $teacherClass->subject_name
            ?? $teacherClass->class_code
            ?? 'Unknown Class';
    }

    protected function formatDateForExport($record): string
    {
        if (!$record->checked_in_at) {
            return "\t" . date('m/d/Y');
        }

        $dateObj = Carbon::parse($record->checked_in_at)->setTimezone($this->timezone);
        return "\t" . $dateObj->format('m/d/Y');
    }

    protected function exportCsv(array $data, string $filename)
    {
        $headers = ['Student Name', 'Student ID', 'Class', 'Date', 'Status'];

        $this->storeCsvCopy($headers, $data, $filename);

        $callback = function () use ($headers, $data) {
            $file = fopen('php://output', 'w');

            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, $headers);

            if (!empty($data)) {
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ]);
    }

    protected function storeCsvCopy(array $headers, array $data, string $filename): void
    {
        $storagePath = storage_path("app/exports/{$filename}.csv");

        if (!is_dir(dirname($storagePath))) {
            mkdir(dirname($storagePath), 0775, true);
        }

        $handle = fopen($storagePath, 'w');
        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
        fputcsv($handle, $headers);

        if (!empty($data)) {
            foreach ($data as $row) {
                fputcsv($handle, $row);
            }
        }

        fclose($handle);
    }
}

