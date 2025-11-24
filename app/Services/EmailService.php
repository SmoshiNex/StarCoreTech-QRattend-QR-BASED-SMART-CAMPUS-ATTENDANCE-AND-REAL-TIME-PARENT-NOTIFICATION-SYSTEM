<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Mail\AttendanceNotificationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    /**
     * Send email notification to parent using Brevo SMTP
     * 
     * @param string $parentEmail
     * @param string $studentName
     * @param string $status (present, late, absent)
     * @param string $className
     * @param string $checkInTime
     * @param int $studentId
     * @param int|null $teacherId
     * @return array
     */
    public function sendParentNotification($parentEmail, $studentName, $status, $className, $checkInTime, $studentId, $teacherId = null)
    {
        try {
            // Prepare email data
            $date = now()->format('F d, Y');
            
            // Send email using Laravel Mail with Brevo SMTP
            Mail::to($parentEmail)->send(
                new AttendanceNotificationMail(
                    $studentName,
                    $status,
                    $className,
                    $checkInTime,
                    $date
                )
            );

            // Log successful notification
            $this->logNotification('student', $studentId, 'email_sent',
                'Email Sent to Parent',
                "Email notification sent to {$parentEmail} regarding {$studentName}'s attendance.",
                [
                    'parent_email' => $parentEmail,
                    'student_name' => $studentName,
                    'status' => $status,
                    'class_name' => $className,
                    'check_in_time' => $checkInTime,
                ],
                'success'
            );

            if ($teacherId) {
                $this->logNotification('teacher', $teacherId, 'email_sent',
                    'Email Sent to Parent',
                    "Email notification sent to {$parentEmail} for student {$studentName}.",
                    [
                        'parent_email' => $parentEmail,
                        'student_name' => $studentName,
                        'status' => $status,
                        'class_name' => $className,
                    ],
                    'success'
                );
            }

            return ['success' => true, 'message' => 'Email sent successfully'];
            
        } catch (\Exception $e) {
            Log::error('Brevo SMTP error: ' . $e->getMessage(), [
                'parent_email' => $parentEmail,
                'student_name' => $studentName,
                'error' => $e->getMessage(),
            ]);

            // Log error notification
            $this->logNotification('student', $studentId, 'email_failed',
                'Email Notification Failed',
                "Error sending email to {$parentEmail}: " . $e->getMessage(),
                [
                    'parent_email' => $parentEmail,
                    'student_name' => $studentName,
                    'status' => $status,
                    'class_name' => $className,
                    'error' => $e->getMessage(),
                ],
                'failed'
            );

            if ($teacherId) {
                $this->logNotification('teacher', $teacherId, 'email_failed',
                    'Email Notification Failed',
                    "Error sending email to {$parentEmail} for student {$studentName}: " . $e->getMessage(),
                    [
                        'parent_email' => $parentEmail,
                        'student_name' => $studentName,
                        'status' => $status,
                        'class_name' => $className,
                        'error' => $e->getMessage(),
                    ],
                    'failed'
                );
            }

            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Log notification to database
     */
    private function logNotification($userType, $userId, $type, $title, $message, $metadata = [], $status = 'success')
    {
        NotificationLog::create([
            'user_type' => $userType,
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'metadata' => $metadata,
            'status' => $status,
        ]);
    }
}

