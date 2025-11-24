<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Teacher;
use App\Models\TeacherClass;
use App\Models\Student;
use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use Carbon\Carbon;

class AttendanceTestDataSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = Teacher::first();
        $class = TeacherClass::first();
        $students = Student::take(3)->get();

        if (!$teacher || !$class || $students->count() === 0) {
            $this->command->error('Missing required data (teacher, class, or students)');
            return;
        }

        // Create attendance sessions for the past 5 days
        for ($i = 0; $i < 5; $i++) {
            $date = Carbon::now()->subDays($i);
            
            $session = AttendanceSession::create([
                'teacher_class_id' => $class->id,
                'started_at' => $date->copy()->setHour(9)->setMinute(0)->setSecond(0),
                'ends_at' => $date->copy()->setHour(10)->setMinute(0)->setSecond(0),
                'status' => 'ended',
                'duration_minutes' => 60,
            ]);

            // Create attendance records for each student
            foreach ($students as $index => $student) {
                $status = ['present', 'late'][$index % 2];
                $checkInTime = $session->started_at->copy()->addMinutes(($index + 1) * 5);
                
                AttendanceRecord::create([
                    'attendance_session_id' => $session->id,
                    'student_id' => $student->id,
                    'checked_in_at' => $checkInTime,
                    'status' => $status,
                ]);
            }
        }

        $this->command->info('Test attendance data created successfully');
    }
}
