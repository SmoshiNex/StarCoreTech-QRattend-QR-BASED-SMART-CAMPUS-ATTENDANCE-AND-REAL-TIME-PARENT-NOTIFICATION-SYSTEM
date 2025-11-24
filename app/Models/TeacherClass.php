<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherClass extends Model
{
    use HasFactory;

    protected $table = 'teacher_classes';

    protected $fillable = [
        'teacher_id',
        'class_code',
        'class_name',
        'subject_name',
        'schedule',
        'room'
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'class_student')->withTimestamps();
    }

    public function attendanceSessions()
    {
        return $this->hasMany(AttendanceSession::class);
    }

    public function activeAttendanceSession()
    {
        return $this->hasOne(AttendanceSession::class)
            ->where('status', 'active')
            ->latest();
    }
}