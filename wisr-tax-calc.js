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

/* Frequency Codes:
 *      - "w" : weekly
 *      - "f" : fortnightly
 *      - "m" : monthly
 *      - "y" : yearly
 */

function validInput (input, type) {
  switch (type) {
    case 'num':
      return typeof input === 'number'

    case 'str':
      return typeof input === 'string'

    case 'freq':
      const freqs = ['w', 'f', 'm', 'y']
      if (!Array.isArray(input)) {
        return freqs.includes(input);
      }
      for (const freq of input) {
        if (!freqs.includes(freq)) {
          return false
        }
      }

    default:
      return false
  }
}

// Formats a number to a currency string format with commas for thousands.
// Input: num (number) : the amount to format.
// Output: A string representing the amount in dollar format
function formatToCurrency (num) {
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

function freqConverter (freqFrom, freqTo) {
  const multipliers = { w: 52, f: 26, m: 12, y: 1 }

  return multipliers[freqFrom] / multipliers[freqTo]
}

function calculateWeeklyTax (gross) {
  if (isValidCurrency(gross)) {
    const nat1004coeffs = [
      [361, 0, 0],
      [500, 0.16, 57.8462],
      [625, 0.26, 107.8462],
      [721, 0.18, 57.8462],
      [865, 0.189, 64.3365],
      [1282, 0.3227, 180.0385],
      [2596, 0.32, 176.5769],
      [3653, 0.39, 358.3077],
      [999999, 0.47, 650.6154]
    ]

    for (const [threshold, rate, offset] of nat1004coeffs) {
      if (gross < threshold) {
        const weeklyTax = rate * weeklyGross - offset

        return weeklyTax
      }
    }
  }

  return -1
}

function getTax (gross, inFreq, outFreq) {
  if (isValidCurrency(gross) && isValidFrequency([inFreq, outFreq])) {
    const weeklyGross = gross * freqConverter(inFreq, 'w')
    const weeklyTax = getWeeklyTax(weeklyGross)

    return weeklyTax * freqConverter('w', outFreq)
  }

  return -1
}

function getNet (gross, inFreq, outFreq) {
  if (isValidCurrency(gross) && isValidFrequency([inFreq, outFreq])) {
    const weeklyGross = gross * freqConverter(inFreq, 'w')
    const weeklyTax = getWeeklyTax(weeklyGross)

    let weeklyNet = weeklyGross - weeklyTax

    return (net = weeklyNet * freqConverter('w', outFreq))
  }

  return -1
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

    let iterationLimit = 1000 // Limit to 1000 iterations, for example
    let iterations = 0
    while (!grossFound && iterations < iterationLimit) {
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
      iterations++
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
