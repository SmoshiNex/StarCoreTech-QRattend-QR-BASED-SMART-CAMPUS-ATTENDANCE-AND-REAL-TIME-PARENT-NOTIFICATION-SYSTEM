<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Student Password Reset Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; line-height: 1.6;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Smart Campus Attendance</h1>
                            <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">QR Attend System</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px 20px;">
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">Dear Parent/Guardian,</p>

                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 15px;">
                                This is to inform you that the password for your child's account has been successfully reset.
                            </p>

                            <!-- Info Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #1a1a1a; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-weight: bold; color: #6b7280; font-size: 14px; padding-bottom: 5px;">Student Name:</td>
                                                            <td align="right" style="color: #111827; font-size: 14px; padding-bottom: 5px;">{{ $studentName }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-weight: bold; color: #6b7280; font-size: 14px; padding-bottom: 5px;">Student ID:</td>
                                                            <td align="right" style="color: #111827; font-size: 14px; padding-bottom: 5px;">{{ $studentId }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-weight: bold; color: #6b7280; font-size: 14px; padding-bottom: 5px;">Reset Time:</td>
                                                            <td align="right" style="color: #111827; font-size: 14px; padding-bottom: 5px;">{{ $resetTime }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Message -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                                            🔒 <strong>Security Notice:</strong> This password reset was initiated using your registered parent email address. If you did not authorize this change, please contact the school administration immediately.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f9ff; border-radius: 6px; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                                            ✓ Your child's password has been successfully updated. They can now log in with their new password.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 20px 0; color: #333333; font-size: 15px;">
                                If you have any questions or concerns about this password reset, please contact the school administration immediately.
                            </p>

                            <p style="margin: 25px 0 0 0; color: #333333; font-size: 14px;">
                                Best regards,<br>
                                <strong style="color: #111827;">Smart Campus Attendance System</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                                This is an automated notification. Please do not reply to this email.
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                &copy; {{ date('Y') }} Smart Campus Attendance - QR Attend System
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>