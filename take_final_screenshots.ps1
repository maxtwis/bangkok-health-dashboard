# PowerShell script to take final screenshots after the routing fix

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

function Take-Screenshot {
    param([string]$filename)
    $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
    $bitmap.Save("C:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\$filename")
    $graphics.Dispose()
    $bitmap.Dispose()
    Write-Host "Screenshot saved: $filename"
}

# Take screenshot of Overview tab (/main - should show spider chart + map)
Write-Host "Opening Overview tab (/main)..."
Start-Process "msedge" "http://localhost:5176/main" -WindowStyle Maximized
Start-Sleep -Seconds 12

Take-Screenshot "final_overview_tab.png"

# Take screenshot of Indicators tab (/ - should show indicators table + map)  
Write-Host "Opening Indicators tab (/)..."
Start-Process "msedge" "http://localhost:5176/" -WindowStyle Maximized
Start-Sleep -Seconds 12

Take-Screenshot "final_indicators_tab.png"

Write-Host "Final screenshots completed!"