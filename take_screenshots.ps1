# PowerShell script to take screenshots of the dashboard

# Open browser to overview tab
Start-Process "msedge" "http://localhost:5176/main"
Start-Sleep -Seconds 8

# Take screenshot of overview tab
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$bitmap.Save("C:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\screenshot_overview.png")
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Overview screenshot saved"

# Wait a moment
Start-Sleep -Seconds 2

# Navigate to indicators tab
Start-Process "msedge" "http://localhost:5176/"
Start-Sleep -Seconds 8

# Take screenshot of indicators tab
$bitmap2 = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics2 = [System.Drawing.Graphics]::FromImage($bitmap2)
$graphics2.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$bitmap2.Save("C:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\screenshot_indicators.png")
$graphics2.Dispose()
$bitmap2.Dispose()

Write-Host "Indicators screenshot saved"