@echo off
title Lucky Nexus - Auto Updater
color 0A
echo.
echo  ============================================
echo   LUCKY NEXUS - AUTO UPDATER
echo   Fetching latest results + AI predictions
echo  ============================================
echo.

python scripts\update.py

if errorlevel 1 (
    echo.
    echo Python not found or error occurred.
    echo.
    echo Please install Python from python.org first,
    echo then run this file again.
    echo.
    pause
)
