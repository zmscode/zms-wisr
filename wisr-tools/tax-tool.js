/*
 * ---
 * Wisr Tax Calculator
 * ---
 *
 * Four functions (toDollars, getWeeklyTax, freqConverter, taxCalc) for tax calculation on income.
 *
 * Tax calculation using the Scale 2 NAT1004 coefficients, for PAYG employees claiming the tax-free threshold.
 *      [ https://www.ato.gov.au/api/public/content/a8c9f1aaa12247eaad9e077b0c2f9b2c?v=f528d73b ]
 *
 * Adapted from the "JAW's Oz Tax Calculator for the Current Financial Year".
 *      [ https://jaws.tips/stuff/taxcalc.html ]
 * Originally created by Jason Waddell ("JAW") on 14 NOV 00.
 *
 * ---
 * zms - created: 04 FEB 25
 * ---
 *
 */

const TAX_CONSTANTS = {
  NAT1004COEFFS: [
      { threshold: 361, rate: 0, offset: 0 },
      { threshold: 500, rate: 0.16, offset: 57.8462 },
      { threshold: 625, rate: 0.26, offset: 107.8462 },
      { threshold: 721, rate: 0.18, offset: 57.8462 },
      { threshold: 865, rate: 0.189, offset: 64.3365 },
      { threshold: 1282, rate: 0.3227, offset: 180.0385 },
      { threshold: 2596, rate: 0.32, offset: 176.5769 },
      { threshold: 3653, rate: 0.39, offset: 358.3077 },
      { threshold: 999999999, rate: 0.47, offset: 650.6154 }
  ],
  FREQUENCY_CODES: { 'w': 52, 'f': 26, 'm': 12, 'y': 1 }
};

// Formats a currency value to a dollar string (e.g. 80000 > $80,000)
function formatCurrency(value) {
  return '$' + Math.round(value).toLocaleString();
}

// Converts from one frequency to another (e.g. 'w' to 'm')
function frequencyConvert(from, to) {
  const multipliers = TAX_CONSTANTS.FREQUENCY_CODES;
  return multipliers[from] / multipliers[to];
}

// Finds the appropriate tax bracket for a given gross income
function getBracket(gross) {
  return TAX_CONSTANTS.NAT1004COEFFS.find(b => gross < b.threshold) || 
         TAX_CONSTANTS.NAT1004COEFFS[TAX_CONSTANTS.NAT1004COEFFS.length - 1];
}

// Calculates the weekly tax for a given gross income
function calculateWeeklyTax(gross) {
  const bracket = getBracket(gross);
  return roundToCents(bracket.rate * gross - bracket.offset);
}

// Calculates the gross income from a target net income using Newton-Raphson method
function calculateGrossFromNet(targetNet, precision = 0.001) {
  let x = targetNet * 1.5; // Initial guess
  let prevX = 0;
  
  while (Math.abs(x - prevX) > precision) {
      prevX = x;
      const bracket = getBracket(x);
      const f = x - bracket.rate * x + bracket.offset - targetNet;
      const fPrime = 1 - bracket.rate;
      x = x - f / fPrime;
  }
  
  return roundToCents(x);
}

// Rounds a value to the nearest cent
function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

// Example usage
console.log(formatCurrency(calculateGrossFromNet(96865 / 52)));