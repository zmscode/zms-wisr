/*
 * ---
 * Wisr Tax Tool
 * ---
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Constants

const TAX_TOOL_CONSTANTS = {

  NAT1004COEFFS: [
    { threshold: 361, rate: 0, offset: 0 },
    { threshold: 500, rate: 0.16, offset: 57.8462 },
    { threshold: 625, rate: 0.26, offset: 107.8462 },
    { threshold: 721, rate: 0.18, offset: 57.8462 },
    { threshold: 865, rate: 0.189, offset: 64.3365 },
    { threshold: 1282, rate: 0.3227, offset: 180.0385 },
    { threshold: 2596, rate: 0.32, offset: 176.5769 },
    { threshold: 3653, rate: 0.39, offset: 358.3077 },
    { threshold: Infinity, rate: 0.47, offset: 650.6154 },
  ],

  FREQUENCY_CODES: {
    w: 52,
    f: 26,
    m: 12,
    y: 1,
  },

  PRECISION: 0.001
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Helper functions

function formatcurrency(value, rounding = 0) {
  switch (rounding) {
    case -1 : 
      return "$" + Math.floor(value).toLocaleString();
    case 0 :
      return "$" + (Math.round(value*100) / 100).toLocaleString();
    case 1 :
      return "$" + Math.ceil(value).toLocaleString();
  }

}

function frequencyconvert(from, to) {
  const multipliers = TAX_TOOL_CONSTANTS.FREQUENCY_CODES;
  return multipliers[from] / multipliers[to];

}

function getbracket(gross) {
  return (TAX_TOOL_CONSTANTS.NAT1004COEFFS.find((b) => gross <= b.threshold) || TAX_TOOL_CONSTANTS.NAT1004COEFFS[TAX_TOOL_CONSTANTS.NAT1004COEFFS.length - 1]);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Main functions

function calculateweeklytax(gross) {
  const bracket = getbracket(gross);
  return bracket.rate * gross - bracket.offset;
}

function calculategrossfromnet(net) {
  let estgross = net * 1.5;
  let prevgross = 0;

  while (Math.abs(estgross - prevgross) > TAX_TOOL_CONSTANTS.PRECISION) {
    prevgross = estgross;
    const bracket = getbracket(estgross);
    const netdiff = estgross - bracket.rate * estgross + bracket.offset - net;
    const ratederivative = 1 - bracket.rate;
    estgross -= netdiff / ratederivative;
  }

  return estgross;
}