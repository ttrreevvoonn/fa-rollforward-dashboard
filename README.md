# Fixed Asset Roll-Forward Dashboard (Practice Project)

A small learning project: a web dashboard that builds a fixed asset
roll-forward (cost and accumulated depreciation) from an asset register,
and checks that it ties out.

**All data is fake.** Do not put real company data in this repo.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The dashboard (what people see) |
| `calc.js` | The accounting logic: depreciation and roll-forward |
| `data/assets.csv` | Fake asset register |
| `scripts/generate_data.py` | Regenerates the fake data |
| `test_calc.js` | Checks the roll-forward ties out for every year |

## Run it locally

```bash
python3 -m http.server
# then open http://localhost:8000
```

Or open `index.html` and use the "Load your own CSV" button.

## Run the tie-out test

```bash
node test_calc.js
```

## Accounting conventions

- Straight-line depreciation, full-month convention (starts the month
  placed in service, includes the month of disposal)
- Assets remain at cost after being fully depreciated until disposed
- Roll-forward is by calendar fiscal year (Jan-Dec)

## Practice ideas

1. Change the capitalization policy or useful life of one class (use a branch and a pull request!)
2. Switch to a half-month or mid-month convention
3. Add a CIP (construction in progress) class
4. Add a table of the largest additions for the year
