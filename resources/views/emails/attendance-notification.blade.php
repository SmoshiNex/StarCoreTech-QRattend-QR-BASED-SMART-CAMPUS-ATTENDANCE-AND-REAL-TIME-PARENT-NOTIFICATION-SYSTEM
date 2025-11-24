<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Attendance Notification</title>
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
                                This is to inform you that <strong style="color: #111827;">{{ $studentName }}</strong> 
                                @if($status === 'present')
                                    <strong style="color: #111827;">is present</strong>
                                @elseif($status === 'late')
                                    <strong style="color: #111827;">arrived late</strong>
                                @else
                                    <strong style="color: #111827;">is absent</strong>
                                @endif
                                for the following class:
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
                                                            <td style="font-weight: bold; color: #6b7280; font-size: 14px; padding-bottom: 5px;">Class:</td>
                                                            <td align="right" style="color: #111827; font-size: 14px; padding-bottom: 5px;">{{ $className }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-weight: bold; color: #6b7280; font-size: 14px; padding-bottom: 5px;">Date:</td>
                                                            <td align="right" style="color: #111827; font-size: 14px; padding-bottom: 5px;">{{ $date }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            @if($checkInTime)
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-weight: bold; color: #6b7280; font-size: 14px; padding-bottom: 5px;">Check-in Time:</td>
                                                            <td align="right" style="color: #111827; font-size: 14px; padding-bottom: 5px;">{{ $checkInTime }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            @endif
                                            <tr>
                                                <td style="padding: 10px 0;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="font-weight: bold; color: #6b7280; font-size: 14px; padding-bottom: 5px;">Status:</td>
                                                            <td align="right" style="padding-bottom: 5px;">
                                                                <span style="display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; 
                                                                    @if($status === 'present')
                                                                        background-color: #B9F8CF; color: #064e3b;
                                                                    @elseif($status === 'late')
                                                                        background-color: #FFF085; color: #854d0e;
                                                                    @else
                                                                        background-color: #FFC9C9; color: #991b1b;
                                                                    @endif">
                                                                    {{ strtoupper($status) }}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; border-radius: 6px; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0; color: #111827; font-size: 14px;">
                                            @if($status === 'present')
                                                ✓ Your child has successfully checked in on time for this class.
                                            @elseif($status === 'late')
                                                ⚠ Your child has checked in, but arrived after the designated time window.
                                            @else
                                                ✗ Your child has not checked in for this class session.
                                            @endif
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 20px 0; color: #333333; font-size: 15px;">
                                If you have any questions or concerns, please contact the school administration.
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

