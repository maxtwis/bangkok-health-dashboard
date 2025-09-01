Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
$bitmap.Save("C:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\screenshot_verification_final.png")
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Screenshot saved to screenshot_initial.png"