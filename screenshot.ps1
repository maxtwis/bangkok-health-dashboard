Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$path = "C:\Users\ion_l_uhhlu4p.MAXTWIS\bangkok-health-dashboard\screenshot_$timestamp.png"

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
$bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()

Write-Output $path