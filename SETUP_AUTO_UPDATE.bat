@echo off
title Lucky Nexus - Setup Auto Updates
color 0B
echo.
echo  ============================================
echo   SETUP AUTOMATIC UPDATES
echo   Runs after every lottery draw
echo  ============================================
echo.
echo  This will schedule your computer to
echo  automatically update predictions:
echo.
echo    Tuesdays + Fridays: Powerball (21:30)
echo    Wednesdays + Saturdays: Lotto (21:30)
echo.
echo  Press any key to set up...
pause >nul

set SCRIPT_PATH=%~dp0UPDATE.bat
set TASK_NAME=LuckyNexus-AutoUpdate

schtasks /create /tn "%TASK_NAME%" /tr "\"%SCRIPT_PATH%\"" /sc weekly /d TUE,WED,FRI,SAT /st 21:30 /f /rl highest

if errorlevel 1 (
    echo.
    echo  FAILED to create scheduled task.
    echo  Try running this file as Administrator:
    echo  Right-click -^> Run as administrator
    echo.
) else (
    echo.
    echo  SUCCESS! Auto-updates scheduled.
    echo.
    echo  Your computer will now automatically:
    echo  - Check for new lottery results
    echo  - Run the AI prediction engine
    echo  - Update predictions
    echo.
    echo  After each draw night, just open the app
    echo  and predictions will be fresh!
    echo.
)

pause
