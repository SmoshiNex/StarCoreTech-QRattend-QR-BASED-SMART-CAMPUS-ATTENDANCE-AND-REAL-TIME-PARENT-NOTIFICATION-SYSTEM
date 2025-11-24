<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AttendanceNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $studentName;
    public $status;
    public $className;
    public $checkInTime;
    public $date;

    /**
     * Create a new message instance.
     */
    public function __construct($studentName, $status, $className, $checkInTime, $date)
    {
        $this->studentName = $studentName;
        $this->status = $status;
        $this->className = $className;
        $this->checkInTime = $checkInTime;
        $this->date = $date;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusMessages = [
            'present' => 'is present',
            'late' => 'arrived late',
            'absent' => 'is absent',
        ];

        $statusMessage = $statusMessages[$this->status] ?? 'has checked in';
        $subject = "Attendance Notification: {$this->studentName} - {$statusMessage}";

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.attendance-notification',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

