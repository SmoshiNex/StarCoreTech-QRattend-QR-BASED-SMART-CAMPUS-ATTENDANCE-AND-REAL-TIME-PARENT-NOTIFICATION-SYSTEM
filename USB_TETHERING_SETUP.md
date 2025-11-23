# Testing with USB Tethering - Quick Guide

This guide helps you test the app on your phone while connected via USB tethering.

## Step 1: Enable USB Tethering on Your Phone

### Android:
1. Connect phone to computer via USB
2. On phone: Settings → Network & Internet → Hotspot & Tethering
3. Enable "USB Tethering"
4. Your phone will share its internet connection with your computer

### iPhone:
1. Connect iPhone to computer via USB
2. On iPhone: Settings → Personal Hotspot
3. Enable "Personal Hotspot"
4. Trust the computer if prompted

## Step 2: Find Your Computer's IP Address

### Windows:
```powershell
# Open PowerShell and run:
ipconfig

# Look for "Ethernet adapter" or "Wireless LAN adapter"
# Find "IPv4 Address" - it will be something like:
# 192.168.42.xxx  (USB tethering usually uses 192.168.42.x)
# or 192.168.1.xxx
```

### Alternative - Quick Method:
```powershell
# Run this in PowerShell:
ipconfig | findstr "IPv4"
```

### Mac/Linux:
```bash
ifconfig | grep "inet "
# or
ip addr show
```

## Step 3: Start Laravel Server

Make sure your server is accessible from the network:

```bash
# Start Laravel server (accessible from network)
php artisan serve --host=0.0.0.0 --port=8000
```

**Important:** Use `--host=0.0.0.0` to allow connections from your phone!

## Step 4: Start Vite Dev Server (for hot reload)

In a **separate terminal**:

```bash
npm run dev
```

This will start Vite on port 5173.

## Step 5: Access from Your Phone

### Option A: Use Your Computer's IP (Easiest)

1. Find your computer's IP (from Step 2)
2. On your phone's browser, go to:
   ```
   http://YOUR_COMPUTER_IP:8000
   ```
   Example: `http://192.168.42.129:8000`

### Option B: Use localhost via USB Debugging (Camera works better!)

**Android:**
1. Enable USB Debugging:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
2. Connect via ADB:
   ```bash
   # Install ADB if you don't have it
   # Then run:
   adb reverse tcp:8000 tcp:8000
   adb reverse tcp:5173 tcp:5173
   ```
3. On phone, access: `http://localhost:8000`

**iPhone:**
- Use the IP method (Option A) - localhost forwarding is more complex on iOS

## Step 6: Fix Camera Access (HTTPS Issue)

Since you're using HTTP (not HTTPS), the camera might be blocked. Here are solutions:

### Solution 1: Enable Insecure Origins in Chrome (Android)

1. On your phone, open Chrome
2. Go to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Enable the flag
4. Add your origin: `http://YOUR_COMPUTER_IP:8000`
   Example: `http://192.168.42.129:8000`
5. Restart Chrome
6. Camera should now work!

### Solution 2: Use localhost via ADB (Android - Recommended)

If you use ADB port forwarding (Option B above), `localhost` is considered secure, so camera works automatically!

### Solution 3: Use Firefox (Alternative)

Firefox sometimes allows camera on HTTP for local IPs:
- Install Firefox on your phone
- Access your app
- Grant camera permission when prompted

## Quick Setup Script

Create a file `start-dev-with-phone.bat` (Windows) or `start-dev-with-phone.sh` (Mac/Linux):

### Windows (`start-dev-with-phone.bat`):
```batch
@echo off
echo Starting Laravel server for phone testing...
echo.

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Your computer IP: %IP%
echo.
echo Access from phone: http://%IP%:8000
echo.
echo Starting servers...
echo.

REM Start Laravel
start "Laravel Server" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"

REM Start Vite
start "Vite Dev Server" cmd /k "npm run dev"

echo.
echo Servers started! Press any key to stop...
pause
```

### Mac/Linux (`start-dev-with-phone.sh`):
```bash
#!/bin/bash

echo "Starting Laravel server for phone testing..."
echo ""

# Get IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "Your computer IP: $IP"
echo ""
echo "Access from phone: http://$IP:8000"
echo ""
echo "Starting servers..."
echo ""

# Start Laravel in background
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!

# Start Vite in background
npm run dev &
VITE_PID=$!

echo "Servers started!"
echo "Press Ctrl+C to stop..."

# Wait for interrupt
trap "kill $LARAVEL_PID $VITE_PID; exit" INT
wait
```

## Troubleshooting

### Phone can't connect to computer
- **Check firewall:** Windows Firewall might be blocking
- **Solution:** Run the `add-firewall-rules.ps1` script as Administrator
- Or manually allow ports 8000 and 5173 in Windows Firewall

### Camera still not working
- Try Solution 1 (Chrome flags) above
- Or use ADB port forwarding (Solution 2) - works best!
- Make sure you granted camera permission in browser

### Assets (CSS/JS) not loading
- Make sure Vite dev server is running (`npm run dev`)
- Check that phone can access `http://YOUR_IP:5173`
- Check browser console for errors

### Connection refused
- Verify server is running with `--host=0.0.0.0`
- Check that phone and computer are on same network (USB tethering creates this)
- Try pinging your computer's IP from phone (use network tools app)

## Recommended Setup for Best Experience

1. **Use ADB port forwarding (Android):**
   ```bash
   adb reverse tcp:8000 tcp:8000
   adb reverse tcp:5173 tcp:5173
   ```
   Then access `http://localhost:8000` on phone
   - Camera works automatically (localhost is secure)
   - No Chrome flags needed
   - Best experience!

2. **Start both servers:**
   ```bash
   # Terminal 1
   php artisan serve --host=0.0.0.0 --port=8000
   
   # Terminal 2
   npm run dev
   ```

3. **Access from phone:**
   - With ADB: `http://localhost:8000`
   - Without ADB: `http://YOUR_COMPUTER_IP:8000`

## Quick Commands Reference

```bash
# Find your IP (Windows)
ipconfig | findstr "IPv4"

# Find your IP (Mac/Linux)
ifconfig | grep "inet "

# Start Laravel (network accessible)
php artisan serve --host=0.0.0.0 --port=8000

# Start Vite
npm run dev

# ADB port forwarding (Android - optional but recommended)
adb reverse tcp:8000 tcp:8000
adb reverse tcp:5173 tcp:5173
```

## Testing Checklist

- [ ] USB tethering enabled on phone
- [ ] Computer IP address found
- [ ] Laravel server running with `--host=0.0.0.0`
- [ ] Vite dev server running
- [ ] Can access app from phone browser
- [ ] Camera permission granted
- [ ] Camera working (or Chrome flags enabled)
- [ ] Can scan QR code
- [ ] Check-in works
- [ ] Notifications appear

---

**Pro Tip:** Using ADB port forwarding with `localhost` is the easiest way - camera works automatically without any flags! 🎯

