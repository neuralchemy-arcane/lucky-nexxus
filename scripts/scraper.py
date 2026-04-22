#!/usr/bin/env python3
"""
SA Lottery Results Scraper
Fetches latest draw results from the official National Lottery website.
Uses Playwright for browser automation to handle dynamically loaded content.
"""

import asyncio
import json
import csv
import os
from datetime import datetime
from playwright.async_api import async_playwright

# Game configurations
GAMES = {
    'lotto': {
        'name': 'SA Lotto',
        'url': 'https://www.nationallottery.co.za/lotto-results',
        'csv_file': 'sa_lotto_results_2000_2026.csv',
        'num_main': 6,
        'delimiter': ',',
    },
    'lotto_plus_1': {
        'name': 'Lotto Plus 1',
        'url': 'https://www.nationallottery.co.za/lotto-plus-1-results',
        'csv_file': 'lotto_plus_1_results.csv',
        'num_main': 6,
        'delimiter': ';',
    },
    'lotto_plus_2': {
        'name': 'Lotto Plus 2',
        'url': 'https://www.nationallottery.co.za/lotto-plus-2-results',
        'csv_file': 'lotto_plus_2_results.csv',
        'num_main': 6,
        'delimiter': ';',
    },
    'powerball': {
        'name': 'Powerball',
        'url': 'https://www.nationallottery.co.za/powerball-results',
        'csv_file': 'powerball_results.csv',
        'num_main': 5,
        'delimiter': ';',
    },
}


async def scrape_game(page, game_key, game_config, data_dir):
    """Scrape the latest result for a specific game."""
    print(f"\n  Scraping {game_config['name']}...")

    try:
        await page.goto(game_config['url'], wait_until='networkidle', timeout=30000)
        await asyncio.sleep(2)  # Wait for dynamic content

        # The website shows latest results in cards - extract numbers from the page
        # Try multiple selectors as the site structure may vary
        result_data = None

        # Method 1: Look for number balls in the latest result section
        selectors = [
            '.result-number',
            '.lotto-number',
            '.number-ball',
            '[class*="number"]',
            '.draw-number',
        ]

        numbers = []
        bonus = None

        for selector in selectors:
            elements = await page.query_selector_all(selector)
            if elements:
                for el in elements:
                    text = await el.inner_text()
                    text = text.strip()
                    if text.isdigit():
                        num = int(text)
                        if num > 0:
                            numbers.append(num)
                if len(numbers) >= game_config['num_main']:
                    break

        # Method 2: Try to find structured data in scripts
        if len(numbers) < game_config['num_main']:
            scripts = await page.query_selector_all('script[type="application/json"]')
            for script in scripts:
                content = await script.inner_text()
                if 'number' in content.lower() or 'draw' in content.lower():
                    try:
                        data = json.loads(content)
                        # Try to extract numbers from JSON structure
                        if isinstance(data, dict):
                            for key in ['numbers', 'winningNumbers', 'results', 'draw']:
                                if key in data:
                                    nums = data[key]
                                    if isinstance(nums, list):
                                        numbers = [int(n) for n in nums if str(n).isdigit()]
                                        break
                    except:
                        pass

        # Method 3: Parse page text for number patterns
        if len(numbers) < game_config['num_main']:
            page_text = await page.inner_text('body')
            # Look for patterns like "Winning Numbers: 1, 2, 3, 4, 5, 6"
            import re
            patterns = [
                r'(?:winning|draw|lotto)\s+(?:numbers?|result)\s*:?\s*([\d\s,]+)',
                r'(?:numbers?|balls?)\s*:?\s*([\d\s,]+)',
            ]
            for pattern in patterns:
                matches = re.findall(pattern, page_text.lower())
                for match in matches:
                    found = [int(n.strip()) for n in match.split(',') if n.strip().isdigit()]
                    if len(found) >= game_config['num_main']:
                        numbers = found
                        break
                if len(numbers) >= game_config['num_main']:
                    break

        # Method 4: Specific DOM structure for nationallottery.co.za
        if len(numbers) < game_config['num_main']:
            # Try to find the latest draw card
            draw_cards = await page.query_selector_all('.draw-card, .result-card, [class*="draw"], [class*="result"]')
            if draw_cards:
                first_card = draw_cards[0]
                num_elements = await first_card.query_selector_all('div, span')
                for el in num_elements:
                    text = await el.inner_text()
                    text = text.strip()
                    if text.isdigit() and int(text) > 0 and int(text) < 100:
                        numbers.append(int(text))

        # Deduplicate while preserving order
        seen = set()
        unique_numbers = []
        for n in numbers:
            if n not in seen and len(unique_numbers) < game_config['num_main'] + 1:
                seen.add(n)
                unique_numbers.append(n)

        main_numbers = unique_numbers[:game_config['num_main']]
        if len(unique_numbers) > game_config['num_main']:
            bonus = unique_numbers[game_config['num_main']]

        # Get the draw date from the page
        date_text = datetime.now().strftime('%d %B %Y')
        day_name = datetime.now().strftime('%A')

        date_elements = await page.query_selector_all('.draw-date, [class*="date"], time')
        for el in date_elements:
            text = await el.inner_text()
            if text.strip():
                date_text = text.strip()
                break

        if len(main_numbers) == game_config['num_main']:
            result_data = {
                'game': game_key,
                'name': game_config['name'],
                'date': date_text,
                'day': day_name,
                'year': datetime.now().year,
                'numbers': main_numbers,
                'bonus': bonus,
                'scraped_at': datetime.now().isoformat(),
            }
            print(f"    ✓ Found: {main_numbers} + Bonus: {bonus}")
        else:
            print(f"    ✗ Only found {len(main_numbers)}/{game_config['num_main']} numbers")
            print(f"    Numbers extracted: {unique_numbers}")

        return result_data

    except Exception as e:
        print(f"    ✗ Error scraping {game_config['name']}: {e}")
        return None


def append_to_csv(result_data, game_config, data_dir):
    """Append a new result to the CSV file if it's not already there."""
    if not result_data:
        return False

    csv_path = os.path.join(data_dir, game_config['csv_file'])
    if not os.path.exists(csv_path):
        print(f"    ! CSV file not found: {csv_path}")
        return False

    # Read existing data
    with open(csv_path, 'r', newline='') as f:
        reader = csv.reader(f, delimiter=game_config['delimiter'])
        rows = list(reader)

    # Check if this draw already exists (compare numbers)
    header = rows[0]
    numbers_str = ','.join(str(n) for n in result_data['numbers'])

    for row in rows[1:]:
        if len(row) >= 6:
            existing_nums = [row[i+3].strip() for i in range(game_config['num_main'])]
            existing_str = ','.join(existing_nums)
            if existing_str == numbers_str:
                print(f"    → Draw already exists in CSV")
                return False

    # Create new row matching CSV format
    num_cols = [str(n) for n in result_data['numbers']]
    while len(num_cols) < 6:
        num_cols.append('')

    bonus = str(result_data['bonus']) if result_data['bonus'] else ''

    if game_config['delimiter'] == ',':
        new_row = [
            str(result_data['year']),
            result_data['day'],
            result_data['date'],
        ] + num_cols + [bonus, '', '']
    else:
        new_row = [
            str(result_data['year']),
            result_data['day'],
            result_data['date'],
        ] + num_cols + [bonus, '', '']

    # Prepend new row (newest first)
    rows.insert(1, new_row)

    # Write back
    with open(csv_path, 'w', newline='') as f:
        writer = csv.writer(f, delimiter=game_config['delimiter'])
        writer.writerows(rows)

    print(f"    ✓ Appended to {game_config['csv_file']}")
    return True


async def scrape_all():
    """Main scraper function."""
    print("=" * 60)
    print("  SA LOTTERY RESULTS SCRAPER")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Determine data directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', 'public', 'data')
    os.makedirs(data_dir, exist_ok=True)

    results = {}
    updated = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = await context.new_page()

        for game_key, game_config in GAMES.items():
            result = await scrape_game(page, game_key, game_config, data_dir)
            results[game_key] = result
            if result:
                updated[game_key] = append_to_csv(result, game_config, data_dir)

        await browser.close()

    # Save scrape log
    log_path = os.path.join(data_dir, 'scrape_log.json')
    with open(log_path, 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'results': results,
            'updated': updated,
        }, f, indent=2, default=str)

    print("\n" + "=" * 60)
    print("  SCRAPE COMPLETE")
    print(f"  Games updated: {sum(1 for v in updated.values() if v)}/{len(updated)}")
    print("=" * 60)

    return results, updated


if __name__ == '__main__':
    asyncio.run(scrape_all())
