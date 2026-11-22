// calc.js - the accounting logic, kept separate from the page so it can be
// reviewed and tested on its own.
//
// Conventions (simple on purpose, change them in a branch to practice!):
//  - Straight-line depreciation, full-month convention:
//    depreciation starts in the month the asset is placed in service
//    and includes the month of disposal.
//  - Assets stay on the books at cost after being fully depreciated
//    until they are disposed.

function monthIndex(isoDate) {
  // "2024-03-01" -> a single number so months are easy to compare
  const [y, m] = isoDate.split("-").map(Number);
  return y * 12 + (m - 1);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => (row[h] = (cells[i] || "").trim()));
    return {
      id: row.asset_id,
      description: row.description,
      cls: row.asset_class,
      cost: Number(row.cost),
      inMi: monthIndex(row.in_service_date),
      life: Number(row.useful_life_months),
      dispMi: row.disposal_date ? monthIndex(row.disposal_date) : null,
    };
  });
}

// Accumulated depreciation on an asset as of a month (stops at disposal)
function accum(a, asOfMi) {
  const end = a.dispMi !== null ? Math.min(asOfMi, a.dispMi) : asOfMi;
  const months = Math.max(0, Math.min(a.life, end - a.inMi + 1));
  return (a.cost / a.life) * months;
}

// Is the asset on the books at the end of a given month?
function onBooks(a, asOfMi) {
  return a.inMi <= asOfMi && (a.dispMi === null || a.dispMi > asOfMi);
}

function rollForward(assets, year) {
  const begMi = (year - 1) * 12 + 11; // Dec of prior year
  const endMi = year * 12 + 11;       // Dec of this year
  const inYear = mi => mi >= year * 12 && mi <= endMi;

  const byClass = {};
  const get = cls =>
    (byClass[cls] = byClass[cls] || {
      cls, begCost: 0, additions: 0, disposals: 0, endCost: 0,
      begAD: 0, depExp: 0, dispAD: 0, endAD: 0, nbv: 0,
      checkCost: 0, checkAD: 0,
    });

  for (const a of assets) {
    const r = get(a.cls);

    // ---- Cost roll-forward ----
    if (onBooks(a, begMi)) r.begCost += a.cost;
    if (inYear(a.inMi)) r.additions += a.cost;
    if (a.dispMi !== null && inYear(a.dispMi)) r.disposals += a.cost;

    // ---- Accumulated depreciation roll-forward ----
    if (onBooks(a, begMi)) r.begAD += accum(a, begMi);
    const dispBeforeYear = a.dispMi !== null && a.dispMi < year * 12;
    if (!dispBeforeYear) r.depExp += accum(a, endMi) - accum(a, begMi);
    if (a.dispMi !== null && inYear(a.dispMi)) r.dispAD += accum(a, a.dispMi);

    // ---- Independent check: balance computed straight from the register ----
    if (onBooks(a, endMi)) {
      r.checkCost += a.cost;
      r.checkAD += accum(a, endMi);
    }
  }

  const rows = Object.values(byClass).sort((x, y) => x.cls.localeCompare(y.cls));
  for (const r of rows) {
    r.endCost = r.begCost + r.additions - r.disposals;
    r.endAD = r.begAD + r.depExp - r.dispAD;
    r.nbv = r.endCost - r.endAD;
  }

  const total = rows.reduce((t, r) => {
    for (const k of Object.keys(r)) if (k !== "cls") t[k] = (t[k] || 0) + r[k];
    return t;
  }, { cls: "Total" });

  // Tie-out: the roll-forward must equal the balance built from the register
  const tiesOut =
    Math.abs(total.endCost - total.checkCost) < 0.01 &&
    Math.abs(total.endAD - total.checkAD) < 0.01;

  return { rows, total, tiesOut };
}

if (typeof module !== "undefined") {
  module.exports = { parseCsv, rollForward };
}
