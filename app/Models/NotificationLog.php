<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class NotificationLog extends Model
{
    protected $fillable = [
        'user_type',
        'user_id',
        'type',
        'title',
        'message',
        'metadata',
        'status',
        'read_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * Scope for teacher notifications
     */
    public function scopeForTeacher(Builder $query, $teacherId)
    {
        return $query->where('user_type', 'teacher')
            ->where('user_id', $teacherId);
    }

    /**
     * Scope for student notifications
     */
    public function scopeForStudent(Builder $query, $studentId)
    {
        return $query->where('user_type', 'student')
            ->where('user_id', $studentId);
    }

    /**
     * Scope for unread notifications
     */
    public function scopeUnread(Builder $query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }
}

