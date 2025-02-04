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
 * zms - 04 FEB 25
 * ---
 * 
 */ 


// Converts a number to a dollar string format with commas for thousands.
// Input: num (number) - the amount to format.
// Output: A string representing the amount in dollar format
function toDollars(num) {
    return "$" + Math.round(num).toLocaleString();

}

// Calculates weekly tax based on gross income using NAT1004 coefficients (Scale 2).
// Input: grossIncome (number) - the gross income amount.
// Output: tax (number) - the calculated weekly tax.
function getWeeklyTax(grossIncome) {
    
    let nat1004coeffs = [
        [361, 0, 0],
        [500, 0.16, 57.8462],
        [625, 0.26, 107.8462],
        [721, 0.18, 57.8462],
        [865, 0.189, 64.3365],
        [1282, 0.3227, 180.0385],
        [2596, 0.32, 176.5769],
        [3653, 0.39, 358.3077],
        [999999, 0.47, 650.6154]
    ];
    
    for (const [ixx, iaa, ibb] of nat1004coeffs) {
        if (grossIncome < ixx) {
            return iaa * grossIncome - ibb;
        }
    
    }

}

// Converts between two frequencies (weekly, fortnightly, monthly, yearly) and returns the multiplier.
// Input: freq1 (number) - starting frequency, freq2 (number) - target frequency.
// Output: freqMult (number) - the conversion multiplier between the two frequencies.
function freqConverter(freq1, freq2) {
    let freqMult = 1;
    const multipliers = { 0: 52, 1: 26, 2: 12, 3: 1 };
    
    freqMult *= multipliers[freq1] / multipliers[freq2];
    return freqMult;
    
}

// Calculates the gross income, tax, and net income based on the given value, frequency, and tax status.
// Inputs: value (number), freq (number), taxed (boolean), returnFreq (boolean - optional, default: false)
// Outputs: Array of formatted strings [gross income, tax, net income]
function taxCalc(value, freq, taxed, returnFreq = false) {
    let gross = 0;
    let tax = 0;
    let net = 0;
    let grossGuess = 999999;
    let iterator = grossGuess / 2;
    let grossFound = false;
    let guessTax = 0;

    if (taxed) {
        gross = value * freqConverter(freq, 0);
        tax = getWeeklyTax(gross);
        net = gross - tax;

        if (returnFreq) {
            gross *= freqConverter(0, freq);
            tax *= freqConverter(0, freq);
            net *= freqConverter(0, freq);
        }

        return [toDollars(gross), toDollars(tax), toDollars(net)];

    } else {
        gross = grossGuess;

        let iterationLimit = 1000; // Limit to 1000 iterations, for example
        let iterations = 0;
        while (!grossFound && iterations < iterationLimit) {
            guessTax = getWeeklyTax(grossGuess);
            net = value * freqConverter(freq, 0);

            if (Math.round((gross - guessTax) * 100) == Math.round(net * 100)) {
                grossFound = true;

            } else {
                if (Math.round((grossGuess - guessTax) * 100) > Math.round(net * 100)) {
                    grossGuess -= iterator;
                } else {
                    grossGuess += iterator;
                }
            }
            iterator /= 2;
            iterations++;
        }
        tax = Math.round((grossGuess - net) * 100) / 100;
        gross = Math.round(grossGuess * 100) / 100;

        if (returnFreq) {
            gross *= freqConverter(0, freq);
            tax *= freqConverter(0, freq);
            net *= freqConverter(0, freq);
        }
        return [toDollars(gross), toDollars(tax), toDollars(net)];

    }

}
