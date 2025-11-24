<?php

namespace App\Console\Commands;

use App\Services\EmailService;
use Illuminate\Console\Command;

class TestEmail extends Command
{
    protected $signature = 'email:test {recipient : The email address to send test to}';
    protected $description = 'Send a test attendance notification email to verify Brevo SMTP configuration';

    public function handle()
    {
        $recipient = $this->argument('recipient');
        
        $this->info('Sending test attendance notification email to: ' . $recipient);
        $this->info('Using Brevo SMTP configuration...');
        
        try {
            $emailService = new EmailService();
            
            // Simulate attendance data
            $studentName = 'Test Student';
            $status = 'present';
            $className = 'Test Class - Mathematics';
            $checkInTime = now()->format('g:i A');
            $studentId = 1; // Dummy ID for testing
            $teacherId = 1; // Dummy ID for testing
            
            $result = $emailService->sendParentNotification(
                $recipient,
                $studentName,
                $status,
                $className,
                $checkInTime,
                $studentId,
                $teacherId
            );
            
            if ($result['success']) {
                $this->info('✅ Email sent successfully!');
                $this->info('Check your inbox (and spam folder) at: ' . $recipient);
                $this->info('The email should look like a real attendance notification.');
                return Command::SUCCESS;
            } else {
                $this->error('❌ Failed to send email!');
                $this->error('Error: ' . $result['message']);
                return Command::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('❌ Failed to send email!');
            $this->error('Error: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            
            return Command::FAILURE;
        }
    }
}
