Option Explicit
On Error Resume Next

Dim WshShell, fso, currentDir, pythonCmd, ret

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script sits
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentDir

' Build Python command
pythonCmd = "python scripts\launcher.py"

' Check if Python is available
If Not fso.FileExists(WshShell.ExpandEnvironmentStrings("%APPDATA%\Python\Python311\Scripts\python.exe")) And _
   Not fso.FileExists(WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\Programs\Python\Python311\python.exe")) Then
    MsgBox "Warning: Python not found in standard locations." & vbCrLf & _
           "Make sure Python 3.11 is installed." & vbCrLf & vbCrLf & _
           "Trying anyway...", 48, "OpenClaw Launch Warning"
End If

' Run Python launcher directly (hidden window, no console)
' 0 = SW_HIDE (Hidden window) - no console visible
ret = WshShell.Run(pythonCmd, 0, False)

If Err.Number <> 0 Then
    ' Fallback: start gateway directly (also hidden, no console)
    Dim fallbackCmd
    fallbackCmd = "node dist\entry.js gateway run --bind loopback --port 18789 --force"
    WshShell.Run fallbackCmd, 0, False
End If

Set WshShell = Nothing
