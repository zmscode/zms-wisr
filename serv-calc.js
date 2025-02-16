/*
 * ---
 * Wisr Serviceability Calculator
 * ---
 *
 * 
 *
 * ---
 * zms - created: 15 FEB 25
 * ---
 *
 */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Imports

import { readFile } from 'fs/promises';
import Papa from 'papaparse';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Constants

const HEM_DATA = await convertLogsToArray();


const HEM_HELPER = {
  STATES: [
    'NSW',
    'VIC',
    'QLD',
    'SA',
    'WA',
    'TAS',
    'NT',
    'ACT'
  ],

  POSTCODE_TABLE: [
    { postcode: 800, rurality: "ALL" },
    { postcode: 832, rurality: "ALL" },
    { postcode: 833, rurality: "ALL" },
    { postcode: 899, rurality: "ALL" },
    { postcode: 2000, rurality: "METRO" },
    { postcode: 2234, rurality: "METRO" },
    { postcode: 2235, rurality: "NONMETRO" },
    { postcode: 2599, rurality: "NONMETRO" },
    { postcode: 2600, rurality: "ALL" },
    { postcode: 2612, rurality: "ALL" },
    { postcode: 2613, rurality: "NONMETRO" },
    { postcode: 2614, rurality: "ALL" },
    { postcode: 2617, rurality: "ALL" },
    { postcode: 2618, rurality: "NONMETRO" },
    { postcode: 2899, rurality: "NONMETRO" },
    { postcode: 2900, rurality: "ALL" },
    { postcode: 2906, rurality: "ALL" },
    { postcode: 2907, rurality: "NONMETRO" },
    { postcode: 2910, rurality: "NONMETRO" },
    { postcode: 2911, rurality: "ALL" },
    { postcode: 2914, rurality: "ALL" },
    { postcode: 2915, rurality: "NONMETRO" },
    { postcode: 2999, rurality: "NONMETRO" },
    { postcode: 3000, rurality: "METRO" },
    { postcode: 3207, rurality: "METRO" },
    { postcode: 3208, rurality: "NONMETRO" },
    { postcode: 3999, rurality: "NONMETRO" },
    { postcode: 4000, rurality: "METRO" },
    { postcode: 4207, rurality: "METRO" },
    { postcode: 4208, rurality: "NONMETRO" },
    { postcode: 4299, rurality: "NONMETRO" },
    { postcode: 4300, rurality: "METRO" },
    { postcode: 4305, rurality: "METRO" },
    { postcode: 4306, rurality: "NONMETRO" },
    { postcode: 4499, rurality: "NONMETRO" },
    { postcode: 4500, rurality: "METRO" },
    { postcode: 4519, rurality: "METRO" },
    { postcode: 4520, rurality: "NONMETRO" },
    { postcode: 4999, rurality: "NONMETRO" },
    { postcode: 5000, rurality: "METRO" },
    { postcode: 5199, rurality: "METRO" },
    { postcode: 5200, rurality: "NONMETRO" },
    { postcode: 5999, rurality: "NONMETRO" },
    { postcode: 6000, rurality: "METRO" },
    { postcode: 6199, rurality: "METRO" },
    { postcode: 6200, rurality: "NONMETRO" },
    { postcode: 6999, rurality: "NONMETRO" },
    { postcode: 7000, rurality: "METRO" },
    { postcode: 7099, rurality: "METRO" },
    { postcode: 7100, rurality: "NONMETRO" },
    { postcode: 7999, rurality: "NONMETRO" },
  ],
};

const FREQUENCY_CODES = {
    w: 52,
    f: 26,
    m: 12,
    y: 1,
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Helper functions

async function convertLogsToArray() {
  try {
    const fileContent = await readFile('HEM.csv', 'utf8');
    
    const result = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    return result.data;
  } catch (error) {
    console.error('Error reading or parsing file:', error);
    throw error;
  }
}

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
  const multipliers = FREQUENCY_CODES;
  return multipliers[from] / multipliers[to];

}

function lookup(value, array, lookupProperty, returnProperty, matchMode = 0) {
  let index = -1;
  
  if (matchMode === 0) {
      index = array.findIndex(item => item[lookupProperty] === value);
  } 
  for (let i = 0; i < array.length; i++) {
    const currentValue = array[i][lookupProperty];
    if (matchMode === -1 && currentValue <= value) {
        index = i;
    } else if (matchMode === 1 && currentValue >= value) {
        index = i;
        break;
    }
  }
  
  return index !== -1 ? array[index][returnProperty] : undefined;

}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Main functions

function togglejoint() {
  return !LOAN_DETAILS.jointloan;
}

function isjoint() {
  return LOAN_DETAILS.jointloan;
}

function postcodesearch(postcode) {
  return lookup(postcode, HEM_HELPER.POSTCODE_TABLE, 'postcode', 'rurality', -1);

}

function calculaterepayments(startBal, rate, months, establishmentfee = 0, brokerfee = 0, monthlyfee = 0, formatted=true) {
  if (rate > 1) {
    rate = rate / 100;
  }
  const totalcredit = startBal + establishmentfee + brokerfee;
  const repayment = totalcredit * (rate / 12) / (1 - Math.pow(1 + ((rate / 12)), -(months))) + monthlyfee;

  if (!formatted) {
    return repayment;
  }

  return formatcurrency(repayment);
  
}


function ytd(ytdincome, asat, taxyearstart = "2024-07-01") {
  taxyearstart = new Date(Date.parse(taxyearstart));
  asat = new Date(Date.parse(asat));
  const datediff = (asat - taxyearstart) / (1000 * 60 * 60 * 24 * 7);
  const annualincome = (ytdincome / datediff) * 52;

  return formatCurrency(annualincome, -1);
}

function calculateHEM(gross, dependents, postcode, state) {
  const rurality = postcodesearch(postcode);
  const maritalStatus = isjoint() ? 2 : 1;

  const incomeBandsArray = [...new Set(HEM_DATA.map(entry => entry.INCOME_BAND))].sort((a, b) => a - b).map(band => ({ value: band }));
  
  const incomeBand = lookup(gross, incomeBandsArray, 'value', 'value', -1);
  
  const hemEntry = HEM_DATA.find(entry => 
    entry.STATE === state &&
    entry.RURALITY === rurality &&
    entry.MARITAL_STATUS === maritalStatus &&
    entry.NUM_DEPENDENTS === dependents &&
    entry.INCOME_BAND === incomeBand
  );

  return hemEntry.HEM;
}

console.log(formatcurrency(calculateHEM(100000, 2, 2000, 'NSW') * frequencyconvert('w', 'm'), 1));