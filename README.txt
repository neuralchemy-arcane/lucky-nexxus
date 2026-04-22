================================================================================
                    LUCKY NEXUS - SA LOTTERY AI PREDICTOR
                         Works Forever - No Coding Needed
================================================================================

WHAT YOU HAVE
-------------
This folder contains a complete lottery prediction app that:
  - Predicts SA Lotto, Lotto Plus 1, Lotto Plus 2, and Powerball
  - Uses 6 AI models running inside your browser
  - Works completely offline (no internet needed)
  - Can update itself with new lottery results
  - Is free forever with no subscriptions

================================================================================
                          QUICK START (2 MINUTES)
================================================================================

STEP 1: OPEN THE APP
--------------------
  Windows: Double-click "OPEN APP.html"
  Mac:     Double-click "OPEN APP.html"
  Phone:   See "INSTALL ON PHONE" section below

  The app will open in your browser with fresh AI predictions.
  You can bookmark this page and use it anytime.

STEP 2: UPDATE PREDICTIONS (Optional)
--------------------------------------
  The app already has 26 years of data built-in and predictions are
  computed live in your browser every time you open it.

  To add the VERY latest draw results:

  WINDOWS:
    1. Double-click "UPDATE.bat"
    2. Wait for it to finish (about 30 seconds)
    3. Your predictions are now updated!

  MAC:
    1. Double-click "UPDATE.command"
    2. Wait for it to finish
    3. Your predictions are now updated!

  The updater will:
    - Fetch the latest results from the official SA lottery website
    - Run all 6 AI prediction models
    - Save fresh predictions automatically
    - Show you the new predicted numbers

STEP 3: SET UP AUTOMATIC UPDATES (Optional - Run Once)
-------------------------------------------------------
  WINDOWS:
    1. Right-click "SETUP_AUTO_UPDATE.bat"
    2. Select "Run as administrator"
    3. Press any key to confirm
    4. Done! Your PC will now auto-update predictions
       every Tuesday, Wednesday, Friday, and Saturday at 21:30
       (30 minutes after the draws close)

  MAC:
    Open Terminal and paste this line:
    
    (crontab -l 2>/dev/null; echo "30 21 * * 2,3,5,6 cd '$(cd "$(dirname "$0")" && pwd)' && python3 scripts/update.py") | crontab -

================================================================================
                      INSTALL ON YOUR PHONE (RECOMMENDED)
================================================================================

ANDROID (Installs as a real app on your home screen):
-----------------------------------------------------
  1. Open the "OPEN APP.html" file in Chrome browser
  2. Tap the 3-dot menu (top right corner)
  3. Tap "Add to Home screen"
  4. Tap "Install"
  5. You now have a "Lucky Nexus" app icon on your phone!
  6. Open it anytime - works offline after first use

IPHONE (Installs as a real app on your home screen):
----------------------------------------------------
  1. Open the "OPEN APP.html" file in Safari browser
  2. Tap the Share button (square with arrow at bottom)
  3. Scroll down and tap "Add to Home Screen"
  4. Tap "Add" (top right)
  5. You now have a "Lucky Nexus" app icon on your phone!
  6. Open it anytime - works offline after first use

================================================================================
                    HOW TO GET LATEST RESULTS MANUALLY
================================================================================

If the auto-updater doesn't work on your computer, you can still keep
predictions fresh by adding results manually in the app:

  1. Open the app (OPEN APP.html)
  2. Scroll to "Add Latest Draw Result"
  3. Check the official results at nationallottery.co.za
  4. Enter the winning numbers + bonus ball
  5. Tap "Add & Re-run AI Predictions"
  6. The AI instantly recalculates everything with the new data!

Your added results are saved forever and the AI uses them for future
predictions. This is actually the MOST reliable way to keep updated.

DRAW SCHEDULE (South Africa Time):
  Tuesday 21:00    - Powerball
  Wednesday 21:00  - Lotto, Plus 1, Plus 2
  Friday 21:00     - Powerball
  Saturday 21:00   - Lotto, Plus 1, Plus 2

================================================================================
                          THE 6 AI MODELS
================================================================================

The app runs these 6 statistical models every time it loads:

  1. Markov Chain (20%)     - Predicts which numbers follow others
  2. Random Forest (30%)    - Statistical feature scoring
  3. Recency Frequency (15%)- Recent hot numbers weighted
  4. Gap Analysis (15%)     - Overdue/cold number detection
  5. Pair Co-occurrence (10%)- Numbers that appear together
  6. Temporal Trend (10%)   - Momentum analysis

The models combine into 20 different prediction strategies per game.

DATA: 7,500+ draws analyzed from 2000-2026

================================================================================
                          REQUIREMENTS
================================================================================

For the app (viewing predictions):
  - Any modern web browser (Chrome, Firefox, Safari, Edge)
  - No internet needed after first load
  - Works on Windows, Mac, Linux, Android, iPhone

For the auto-updater (fetching new results):
  - Windows: Python 3 (free from python.org)
  - Mac: Python 3 (pre-installed on most Macs)

================================================================================
                          TROUBLESHOOTING
================================================================================

"UPDATE.bat" doesn't work?
  - Install Python from https://python.org (check "Add to PATH")
  - Then try again

App doesn't open?
  - Try a different browser (Chrome recommended)
  - Make sure you're opening "OPEN APP.html"

Want to use on multiple devices?
  - Copy the entire "dist" folder to a USB drive
  - Or upload to Google Drive / Dropbox
  - Open "OPEN APP.html" on any device

Predictions look the same?
  - The AI needs new draw data to change predictions
  - Run UPDATE.bat or add results manually
  - Predictions evolve as new draws are added

================================================================================
                          RESPONSIBLE GAMBLING
================================================================================

Lottery draws are RANDOM. No prediction can guarantee wins.
This tool analyzes historical patterns for entertainment only.
If gambling is a problem, call 0800 006 008 (South Africa).

================================================================================
                          SUPPORT
================================================================================

If you need help:
  1. The app has a built-in "Add Latest Draw Result" button
  2. That is the most reliable way to keep predictions updated
  3. Everything is saved in your browser automatically

================================================================================
