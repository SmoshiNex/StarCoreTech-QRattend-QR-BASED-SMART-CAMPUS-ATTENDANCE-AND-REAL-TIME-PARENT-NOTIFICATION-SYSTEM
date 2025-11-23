# Brevo (Sendinblue) SMTP Configuration Guide

This guide will help you set up Brevo SMTP for sending parent email notifications when students check in.

## Overview

The system uses Brevo's SMTP service via Laravel Mail. Brevo offers a free tier with 300 emails/day, making it perfect for attendance notifications.

## Setup Steps

### 1. Create a Brevo Account

1. Go to [https://www.brevo.com/](https://www.brevo.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get SMTP Credentials

1. Log into your Brevo dashboard
2. Go to **Settings** → **SMTP & API**
3. Click on **SMTP** tab
4. You'll see your SMTP credentials:
   - **Server**: `smtp-relay.brevo.com`
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Login**: Your Brevo account email address
   - **Password**: Your SMTP key (click "Generate" if you don't have one)

### 3. Configure Your .env File

Add these to your `.env` file:

```env
# Brevo SMTP Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your-brevo-email@example.com
MAIL_PASSWORD=your-brevo-smtp-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-brevo-email@example.com
MAIL_FROM_NAME="Smart Campus Attendance"
```

**Important:**
- `MAIL_USERNAME` = Your Brevo account email address
- `MAIL_PASSWORD` = Your Brevo SMTP key (not your account password!)
- `MAIL_FROM_ADDRESS` = Should match your Brevo verified sender email

### 4. Verify Sender Email (Important!)

1. In Brevo dashboard, go to **Settings** → **Senders**
2. Add and verify your sender email address
3. Check your email inbox for verification link
4. Click the verification link
5. Use this verified email as `MAIL_FROM_ADDRESS`

### 5. Clear Configuration Cache

After updating `.env`:

```bash
php artisan config:clear
php artisan config:cache
```

## How It Works

1. **Student Checks In:**
   - Student scans QR code
   - System records attendance
   - If student has `parent_email` set, email is automatically sent

2. **Email Content:**
   - Professional HTML email template
   - Student name, class name, check-in time
   - Attendance status (Present/Late/Absent)
   - Date and time information

3. **Email Delivery:**
   - Sent via Brevo SMTP
   - Logged in notification system
   - Errors are logged for troubleshooting

## Testing

### Test Email Configuration

1. Make sure a student has `parent_email` set
2. Have the student check in using QR code
3. Check the parent's email inbox
4. Check notification logs in dashboard for email status

### Test with Tinker

You can test email sending directly:

```bash
php artisan tinker
```

Then run:
```php
use App\Mail\AttendanceNotificationMail;
use Illuminate\Support\Facades\Mail;

Mail::to('test@example.com')->send(
    new AttendanceNotificationMail(
        'John Doe',
        'present',
        'Computer Programming',
        '8:30 AM',
        now()->format('F d, Y')
    )
);
```

## Troubleshooting

### Emails Not Sending

1. **Check .env Configuration:**
   - Verify all MAIL_* variables are set correctly
   - Ensure no typos in credentials
   - Make sure you're using SMTP key, not account password

2. **Check Brevo Credentials:**
   - Verify SMTP username (your Brevo email)
   - Verify SMTP password (your SMTP key from Brevo dashboard)
   - Make sure SMTP key is generated and active

3. **Check Sender Verification:**
   - Sender email must be verified in Brevo
   - Go to **Settings** → **Senders** to verify
   - `MAIL_FROM_ADDRESS` must match verified sender

4. **Check Logs:**
   - View `storage/logs/laravel.log` for error messages
   - Check notification logs in the dashboard
   - Check Brevo dashboard for delivery logs

### Common Errors

**"Connection timeout"**
- Check if SMTP host is correct: `smtp-relay.brevo.com`
- Verify port number (587 for TLS, 465 for SSL)
- Check firewall settings

**"Authentication failed"**
- Verify SMTP username (your Brevo email)
- Verify SMTP password (your SMTP key, not account password)
- Make sure SMTP key is generated in Brevo dashboard
- Check if account is active

**"Sender address rejected"**
- Sender email must be verified in Brevo
- Go to **Settings** → **Senders** and verify your email
- `MAIL_FROM_ADDRESS` must match verified sender email

**"Could not instantiate mail driver"**
- Verify `MAIL_MAILER` is set to `smtp`
- Clear config cache: `php artisan config:clear`

**"Daily sending limit exceeded"**
- Free tier: 300 emails/day
- Check your usage in Brevo dashboard
- Consider upgrading plan for higher limits

### Free Tier Limitations

- **300 emails per day** (free tier)
- Sender email must be verified
- Some features may be limited
- For higher limits, upgrade to paid plan

## Brevo Pricing

- **Free Tier:** 300 emails/day (9,000/month)
- **Lite:** €25/month for 10,000 emails/month
- **Premium:** €65/month for 20,000 emails/month
- See [Brevo Pricing](https://www.brevo.com/pricing/) for details

## Production Recommendations

1. **Verify Sender Domain:**
   - Add and verify your own domain in Brevo
   - Better deliverability
   - Professional sender address
   - Higher sending limits

2. **Monitor Email Logs:**
   - Check Brevo dashboard for delivery stats
   - Check notification logs in the system
   - Set up alerts for email failures

3. **Rate Limiting:**
   - Free tier: 300 emails/day
   - Consider queueing emails for high volume
   - Use `QUEUE_CONNECTION=database` and `php artisan queue:work`

4. **SPF/DKIM Records:**
   - Brevo provides DNS records for verified domains
   - Improves email deliverability
   - Reduces chance of emails going to spam

## Security Notes

- Never commit `.env` file to version control
- Keep SMTP credentials secure
- Use TLS encryption (port 587)
- Regularly rotate SMTP keys
- Monitor for unauthorized usage

## Quick Reference

**Brevo SMTP Settings:**
- Host: `smtp-relay.brevo.com`
- Port: `587` (TLS) or `465` (SSL)
- Username: Your Brevo account email
- Password: Your Brevo SMTP key (generate in dashboard)

**Required .env Variables:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-smtp-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-verified-email@example.com
MAIL_FROM_NAME="Smart Campus Attendance"
```

## Support

If you encounter issues:
1. Check `storage/logs/laravel.log`
2. Check Brevo dashboard for delivery logs
3. Verify SMTP credentials in Brevo dashboard
4. Ensure sender email is verified
5. Test with a simple email first
6. Check notification logs in the dashboard

---

**Note:** The system now uses Brevo SMTP. Make sure to configure your Brevo SMTP credentials in `.env` file and verify your sender email address.

