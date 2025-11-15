<?php

namespace App\Policies;

use App\Models\Teacher;
use App\Models\TeacherClass;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeacherClassPolicy
{
    use HandlesAuthorization;

    public function update(Teacher $teacher, TeacherClass $class)
    {
        return $teacher->id === $class->teacher_id;
    }

    public function delete(Teacher $teacher, TeacherClass $class)
    {
        return $teacher->id === $class->teacher_id;
    }
}