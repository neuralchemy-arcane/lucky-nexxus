#!/bin/bash
# Lucky Nexus - Auto Updater for Mac/Linux
# Double-click to run

cd "$(dirname "$0")"
echo "========================================"
echo "  LUCKY NEXUS - AUTO UPDATER"
echo "========================================"
python3 scripts/update.py
read -p "Press Enter to exit..."
