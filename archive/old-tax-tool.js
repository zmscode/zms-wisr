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

function validInput (input, type) {
    switch (type) {
        case 'curr':
            return typeof input === 'number' && (input < constants.CURR_MAX_VALUE);

        case 'tax':
            return (typeof input === 'number') && (between(input, 0, CURR_MAX_VALUE));

        case 'freq':
            if (!Array.isArray(input)) {
                return FREQUENCY_CODES.includes(input);
            }
            for (const freq of input) {
                if (!FREQUENCY_CODES.includes(freq)) {
                    return false;
                }
            }
            return true;

        default:
            return false;
    }
}

function isTaxable(income) {
  if (!validInput(income, 'curr') || income < 18200) {
    return ERROR_CODE;
  }

  return true;
}

/* Formats a currency value to a dollar string (e.g. 80000 > $80,000).
 *
 * Input:
 *      - value (number): the value to be formatted
 * Output:
 *      - return (string): the converted dollar value
 */
function formatCurrency(value) {
    if (!isTaxable(value, 'y')) {
        return ERROR_CODE;
    }

    return '$' + Math.round(value).toLocaleString();
}

/* Calculates the frequency conversion factor.
 * Note:
 *      - Converts the 'from' frequency to yearly then back to the 'to' frequency.
 *      - e.g. fortnightly to monthly: fortnightly > yearly > monthly
 *
 * Input:
 *      - from (frequency): the frequency to convert from.
 *      - to (frequency): the frequency to convert to.
 * Output:
 *      - conversion (number): the conversion factor between the two frequencies.
 */
function frequencyConvert(from, to) {
    if (!validInput([from, to], 'freq')) {
        return ERROR_CODE;
    }
    
    const multipliers = { 'w': 52, 'f': 26, 'm': 12, 'y': 1 };
    
    return multipliers[from] / multipliers[to];
}

function calculateWeeklyTax(gross) {
    if (!validInput(gross, 'curr')) {
        return ERROR_CODE;
    }

  for (const [threshold, rate, offset] of NAT1004COEFFS) {
    if (gross < threshold) {
      const weeklyTax = rate * gross - offset;

      return weeklyTax;
    }
  }
}

function getTax (gross, inFreq, outFreq) {
    if (!validInput(gross, 'curr') || !validInput([inFreq, outFreq], 'freq')) {
        return ERROR_CODE;
    }

    const weeklyGross = gross * frequencyConvert(inFreq, 'w');
    const weeklyTax = calculateWeeklyTax(weeklyGross);

    return weeklyTax * frequencyConvert('w', outFreq);
}

function getNet (gross, inFreq, outFreq) {
    if (!validInput(gross, 'curr') || !validInput([inFreq, outFreq], 'freq')) {
        return ERROR_CODE;
    }

    const weeklyGross = gross * frequencyConvert(inFreq, 'w');
    const weeklyTax = calculateWeeklyTax(weeklyGross);
    const weeklyNet = weeklyGross - weeklyTax;

    return weeklyNet * frequencyConvert('w', outFreq);
}

function getGross(net, inFreq, outFreq) {
    if (!validInput(net, "curr") || !validInput([inFreq, outFreq], "freq")) {
        return ERROR_CODE;
    }

    let weeklyNet = net * frequencyConvert(inFreq, "w");

    let lowerBound = weeklyNet * 1.1;
    let upperBound = weeklyNet * 1.5;
    let precision = 0.001;

    while (upperBound - lowerBound > precision) {
        let guessGross = (lowerBound + upperBound) / 2;
        let guessTax = calculateWeeklyTax(guessGross);
        let guessNet = guessGross - guessTax;

        if (Math.abs(guessNet - weeklyNet) < precision) {
            return guessGross * frequencyConvert("w", outFreq);
        }

        if (guessNet > weeklyNet) {
            upperBound = guessGross;
        } else {
            lowerBound = guessGross;
        }
    }

    return ((lowerBound + upperBound) / 2) * frequencyConvert("w", outFreq);
}

console.log(getGross(96865, 'y', 'm'));
