#!/bin/bash
# =============================================================================
# Lucky Nexus - Auto Update Pipeline
# =============================================================================
# This script:
#   1. Scrapes latest results from SA National Lottery website
#   2. Appends new draws to CSV data files
#   3. Runs the 6-model AI prediction engine
#   4. Rebuilds the React app
#   5. (Optional) Deploys the updated site
#
# USAGE:
#   chmod +x scripts/auto_update.sh
#   ./scripts/auto_update.sh
#
# SCHEDULING:
#   Run after each draw (Tue/Fri 21:30, Wed/Sat 21:30 SA time)
#   Using cron: 30 21 * * 2,3,5,6 /path/to/scripts/auto_update.sh
# =============================================================================

set -e  # Exit on error

echo "========================================"
echo "  LUCKY NEXUS - AUTO UPDATE PIPELINE"
echo "  Started: $(date)"
echo "========================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$PROJECT_DIR/public/data"

cd "$PROJECT_DIR"

# ---- Step 1: Ensure data directory exists ----
echo ""
echo "[1/5] Setting up data directory..."
mkdir -p "$DATA_DIR"

# Copy CSV files if they don't exist in data dir
for csv in sa_lotto_results_2000_2026.csv lotto_plus_1_results.csv lotto_plus_2_results.csv powerball_results.csv; do
    if [ -f "$PROJECT_DIR/$csv" ]; then
        cp "$PROJECT_DIR/$csv" "$DATA_DIR/$csv" 2>/dev/null || true
    fi
done

# ---- Step 2: Scrape latest results ----
echo ""
echo "[2/5] Scraping latest results..."
cd "$PROJECT_DIR"
python3 -c "
import asyncio
import sys
sys.path.insert(0, 'scripts')
from scraper import scrape_all
try:
    asyncio.run(scrape_all())
except Exception as e:
    print(f'Scraper error: {e}')
    print('Continuing with existing data...')
" || echo "  Scraper skipped - using existing data"

# ---- Step 3: Run AI predictions ----
echo ""
echo "[3/5] Running AI prediction engine..."
python3 -c "
import sys
sys.path.insert(0, 'scripts')
from predictor import run_predictions
run_predictions('public/data', 'public/predictions.json')
"

# ---- Step 4: Build React app ----
echo ""
echo "[4/5] Building React app..."
cd "$PROJECT_DIR"
npm run build

# Copy predictions.json to dist
cp "$PROJECT_DIR/public/predictions.json" "$PROJECT_DIR/dist/" 2>/dev/null || true
cp "$PROJECT_DIR/public/logo.png" "$PROJECT_DIR/dist/" 2>/dev/null || true
cp "$PROJECT_DIR/public/noise-texture.jpg" "$PROJECT_DIR/dist/" 2>/dev/null || true
cp "$PROJECT_DIR/public/icons-analytics.png" "$PROJECT_DIR/dist/" 2>/dev/null || true

# ---- Step 5: Done ----
echo ""
echo "========================================"
echo "  UPDATE COMPLETE!"
echo "  Finished: $(date)"
echo ""
echo "  Next steps:"
echo "  - Deploy the 'dist/' folder"
echo "  - Or run: npx vite preview"
echo "========================================"
