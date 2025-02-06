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


/* 
 * FREQUENCY:
 *      - 'w'       : weekly
 *      - 'f'       : fortnightly
 *      - 'm'       : monthly
 *      - 'y'       : yearly
 * 
 * INPUT:
 *      - 'curr'    : currency (number)
 *      - 'tax'     : tax (number + positive)
 *      - 'freq'    : frequency (string)
 * 
 */

import { NAT1004COEFFS, MAX_VALUE, ERROR_CODE, FREQUENCY_CODES } from './constants.js';

function validInput (input, type) {
    switch (type) {
        case 'curr':
            return typeof input === 'number' && (input < MAX_VALUE);

        case 'tax':
            return (typeof input === 'number') && (input >= 0) && (input < MAX_VALUE);

        case 'freq':
            if (!Array.isArray(input)) {
                return FREQUENCY_CODES.includes(input)
            }
            for (const freq of input) {
                if (!FREQUENCY_CODES.includes(freq)) {
                    return false
                }
            }
            return true

        default:
            return false
    }
}

function formatCurrency(value) {
    if (!validInput(value, 'curr')) {
        return ERROR_CODE;
    }

    return '$' + Math.round(num).toLocaleString()
}

/* Calculates the frequency conversion factor.
 * Note:
 *      - Converts the 'from' frequency to yearly then back to the 'to' frequency.
 *      - e.g. fortnightly to monthly: fortnightly > yearly > monthly
 *
 * Input:
 *      - freqFrom (frequency): the frequency to convert from.
 *      - freqTo (frequency): the frequency to convert to.
 * Output:
 *      - conversion (number): the conversion factor between the two frequencies.
 */
function frequencyConvert(from, to) {
    if (!validInput([from, to], 'freq')) {
        return ERROR_CODE;
    }
    
    const multipliers = { 'w': 52, 'f': 26, 'm': 12, 'y': 1 };
    
    return multipliers[from] / multipliers[to]
}

function calculateWeeklyTax(gross) {
    if (!validInput(gross, 'curr')) {
        return errorCode;
    }

  for (const [threshold, rate, offset] of NAT1004COEFFS) {
    if (gross < threshold) {
      const weeklyTax = rate * weeklyGross - offset

      return weeklyTax
    }
  }
}

function getTax (gross, inFreq, outFreq) {
    if (!validInput(gross, 'curr') || !validInput([inFreq, outFreq], 'freq')) {
        return errorCode;
    }

    const weeklyGross = gross * frequencyConvert(inFreq, 'w');
    const weeklyTax = getWeeklyTax(weeklyGross);

    return weeklyTax * frequencyConvert('w', outFreq);
}

function getNet (gross, inFreq, outFreq) {
    if (!validInput(gross, 'curr') || !validInput([inFreq, outFreq], 'freq')) {
        return errorCode;
    }

    const weeklyGross = gross * frequencyConvert(inFreq, 'w');
    const weeklyTax = getWeeklyTax(weeklyGross);
    const weeklyNet = weeklyGross - weeklyTax;

    return weeklyNet * frequencyConvert('w', outFreq);
}

function getGross(net, inFreq, outFreq) {
    if (!validInput(net, "curr") || !validInput([inFreq, outFreq], "freq")) {
        return ERROR_CODE;
    }

    

}

// Calculates the gross income, tax, and net income based on the given value, frequency, and tax status.
// Inputs: value (number), freq (number), taxed (boolean), returnFreq (boolean - optional, default: false)
// Outputs: Array of formatted strings [gross income, tax, net income]
function taxCalc (value, freq, taxed, returnFreq = false) {
  let gross = 0
  let tax = 0
  let net = 0
  let grossGuess = 999999
  let iterator = grossGuess / 2
  let grossFound = false
  let guessTax = 0

  if (taxed) {
    gross = value * freqConverter(freq, 0)
    tax = getWeeklyTax(gross)
    net = gross - tax

    if (returnFreq) {
      gross *= freqConverter(0, freq)
      tax *= freqConverter(0, freq)
      net *= freqConverter(0, freq)
    }

    return [toDollars(gross), toDollars(tax), toDollars(net)]
  } else {
    gross = grossGuess

    while (!grossFound) {
      guessTax = getWeeklyTax(grossGuess)
      net = value * freqConverter(freq, 0)

      if (Math.round((gross - guessTax) * 100) == Math.round(net * 100)) {
        grossFound = true
      } else {
        if (Math.round((grossGuess - guessTax) * 100) > Math.round(net * 100)) {
          grossGuess -= iterator
        } else {
          grossGuess += iterator
        }
      }
      iterator /= 2
    }
    tax = Math.round((grossGuess - net) * 100) / 100
    gross = Math.round(grossGuess * 100) / 100

    if (returnFreq) {
      gross *= freqConverter(0, freq)
      tax *= freqConverter(0, freq)
      net *= freqConverter(0, freq)
    }
    return [toDollars(gross), toDollars(tax), toDollars(net)]
  }
}
