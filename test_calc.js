// Run with:  node test_calc.js
// Checks that the roll-forward ties to the asset register for every year.
const fs = require("fs");
const { parseCsv, rollForward } = require("./calc.js");

const assets = parseCsv(fs.readFileSync("data/assets.csv", "utf8"));
let failed = false;

for (let year = 2021; year <= 2025; year++) {
  const { total, tiesOut } = rollForward(assets, year);
  const cost = total.begCost + total.additions - total.disposals;
  console.log(
    `${year}: end cost ${total.endCost.toFixed(0)}  end A/D ${total.endAD.toFixed(0)}  ` +
    `NBV ${total.nbv.toFixed(0)}  ties out: ${tiesOut}`
  );
  if (!tiesOut || Math.abs(cost - total.endCost) > 0.01) failed = true;
}

// Beginning balance of year N must equal ending balance of year N-1
for (let year = 2022; year <= 2025; year++) {
  const prev = rollForward(assets, year - 1).total;
  const cur = rollForward(assets, year).total;
  if (Math.abs(prev.endCost - cur.begCost) > 0.01 || Math.abs(prev.endAD - cur.begAD) > 0.01) {
    console.log(`${year}: beginning balance does not match prior year ending`);
    failed = true;
  }
}

console.log(failed ? "FAILED" : "All checks passed");
process.exit(failed ? 1 : 0);
