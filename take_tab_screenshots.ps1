# PowerShell script to take screenshots of both overview and indicators tabs

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class WinAPI {
        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool SetForegroundWindow(IntPtr hWnd);
        [DllImport("user32.dll")]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    }
"@

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

# Open overview page and wait for load
Write-Host "Opening overview page..."
Start-Process "msedge" "http://localhost:5176/main" -WindowStyle Maximized
Start-Sleep -Seconds 10

# Take overview screenshot
Take-Screenshot "screenshot_overview_tab.png"

# Navigate to indicators by clicking on root URL (which shows indicators by default)
Write-Host "Navigating to indicators tab..."
Start-Process "msedge" "http://localhost:5176/" -WindowStyle Maximized
Start-Sleep -Seconds 8

# Take indicators screenshot
Take-Screenshot "screenshot_indicators_tab.png"

Write-Host "Screenshots completed!"