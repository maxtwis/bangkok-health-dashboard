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

# Click on Bangkok Health Dashboard tab 
[Mouse]::SetCursorPos(115, 15)
Start-Sleep -Milliseconds 100
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)

Write-Host "Clicked on Bangkok Health Dashboard tab"