<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceSession extends Model
{
    protected $fillable = [
        'teacher_class_id',
        'duration_minutes',
        'started_at',
        'ends_at',
        'ended_at',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ends_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function teacherClass(): BelongsTo
    {
        return $this->belongsTo(TeacherClass::class);
    }

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function isActive(): bool
    {
        // Session is active if status is 'active' and current time is before ends_at
        // This allows QR codes to remain valid for the entire class duration
        return $this->status === 'active' && now()->lt($this->ends_at);
    }

    public function isTimeForPresent(): bool
    {
        // Student is marked as "present" if they check in within the duration_minutes window
        // After that, they are marked as "late" but can still check in until session ends
        $allowedTime = $this->started_at->copy()->addMinutes($this->duration_minutes);
        return now()->lte($allowedTime);
    }
}
