"""Generate FAKE fixed asset data for the practice dashboard.

Run from the project root:
    python3 scripts/generate_data.py

Output: data/assets.csv  (all values are made up)
"""
import csv
import os
import random
from datetime import date

random.seed(42)  # same seed = same fake data every time

# class name: (useful life in months, min cost, max cost)
CLASSES = {
    "Computer Equipment": (36, 1500, 25000),
    "Production Equipment": (60, 20000, 400000),
    "Furniture & Fixtures": (84, 800, 30000),
    "Leasehold Improvements": (120, 50000, 900000),
    "Capitalized Software": (36, 25000, 350000),
}

rows = []
n = 1
for cls, (life, lo, hi) in CLASSES.items():
    for _ in range(26):
        year = random.choice([2021, 2022, 2023, 2024, 2025])
        in_service = date(year, random.randint(1, 12), 1)
        cost = round(random.uniform(lo, hi), 2)

        disposal = ""
        # ~18% of assets get disposed some time after being placed in service
        if random.random() < 0.18:
            d_year = random.randint(year, 2025)
            d_month = random.randint(1, 12)
            d = date(d_year, d_month, 1)
            if d > in_service:
                disposal = d.isoformat()

        rows.append({
            "asset_id": f"FA-{n:04d}",
            "description": f"{cls} item {n}",
            "asset_class": cls,
            "cost": f"{cost:.2f}",
            "in_service_date": in_service.isoformat(),
            "useful_life_months": life,
            "disposal_date": disposal,
        })
        n += 1

os.makedirs("data", exist_ok=True)
with open("data/assets.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)

print(f"Wrote {len(rows)} fake assets to data/assets.csv")
