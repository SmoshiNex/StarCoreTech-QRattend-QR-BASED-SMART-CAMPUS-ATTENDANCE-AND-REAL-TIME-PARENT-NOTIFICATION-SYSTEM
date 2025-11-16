<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Student extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'student_id',
        'first_name',
        'last_name',
        'email',
        'course',
        'year_level',
        'section',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function classes()
    {
        return $this->belongsToMany(TeacherClass::class, 'class_student', 'student_id', 'teacher_class_id');
    }
}