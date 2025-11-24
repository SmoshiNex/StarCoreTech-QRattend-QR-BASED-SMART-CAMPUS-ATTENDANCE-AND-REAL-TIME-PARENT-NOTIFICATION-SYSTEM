# Run this script as Administrator to add firewall rules
Write-Host "Adding firewall rules for Laravel and Vite dev servers..." -ForegroundColor Yellow

# Add rule for Laravel (port 8000)
New-NetFirewallRule -DisplayName "Laravel Dev Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -ErrorAction SilentlyContinue
Write-Host "✓ Added rule for Laravel Dev Server (port 8000)" -ForegroundColor Green

# Add rule for Vite (port 5173)
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -Protocol TCP -LocalPort 5173 -Action Allow -ErrorAction SilentlyContinue
Write-Host "✓ Added rule for Vite Dev Server (port 5173)" -ForegroundColor Green

Write-Host "`nFirewall rules added successfully! Try accessing from your phone now." -ForegroundColor Green
Write-Host "URL: http://10.49.25.119:8000" -ForegroundColor Cyan
