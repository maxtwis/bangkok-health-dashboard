Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    
    public const uint MOUSEEVENTF_LEFTDOWN = 0x02;
    public const uint MOUSEEVENTF_LEFTUP = 0x04;
}
"@

# Move cursor to language switcher button (Thai dropdown in top-right)
[Mouse]::SetCursorPos(1270, 158)
Start-Sleep -Milliseconds 100

# Click
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)

Write-Host "Clicked on language switcher"