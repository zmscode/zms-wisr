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

import sql from "./db.js";

async function getAllHemData() {
    try {
        const data = await sql`
      SELECT * FROM "HEMDATA"
    `
        return data
    } catch (error) {
        console.error('Error fetching HEMDATA:', error)
        throw error
    }
}

console.log(getAllHemData());




import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Papa from 'papaparse';

let globalHemData = null;

const CURR_YEAR = new Date().getFullYear().toString().substring(0, 4);
const TAX_YEAR_START = ((Number(CURR_YEAR) - 1) + '-07-01');

const POSTCODE_TABLE = [
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
];

const FREQUENCY_CODES = {
  w: 52,
  f: 26,
  m: 12,
  y: 1
};

const INCOME_BANDS = [0, 26000, 39000, 52000, 64000, 77000, 103000, 129000, 155000, 180000, 206000, 258000, 322000, 386000, 644000 ];
const CREDIT_CARD_RATE = 0.038;
const MORTGAGE_BUFFER = 0.05;

let LOAN_DETAILS = {
  amount: 25000,
  product: "unsecured",
  rate: 0.1,
  term: 84,
  channel: "broker",
  jointloan: false
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

async function loadHEMData() {
  if (globalHemData !== null) {
      return globalHemData;
  }

  try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const filePath = join(__dirname, 'HEM.csv');
      
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      let parsedData = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
      });
      
      let lookupData = {};
      
      parsedData.data.forEach((row) => {
          if (row.STATE && row.RURALITY && row.MARITAL_STATUS !== undefined) {
              const key = `${row.STATE}_${row.RURALITY}_${row.MARITAL_STATUS}_${row.NUM_DEPENDENTS}_${row.INCOME_BAND}`;
              lookupData[key] = row.HEM;
          }
      });
      
      globalHemData = lookupData;
      return lookupData;
  } catch (error) {
      console.error('Detailed error:', error);
      throw new Error(`Failed to load HEM data: ${error.message}`);
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

function frequencyconvert(from, to = 'y') {
  return FREQUENCY_CODES[from] / FREQUENCY_CODES[to];
}

function getNestedValue(obj, key) {
  return obj[key];
}

function findclosestcomplex(value, arr, searchKey, returnKey, mode = 0) {
  if (!arr || arr.length === 0) return null;

  switch (mode) {
      case -1: // Next lowest
          return arr.reduce((closest, item) => {
              const currentValue = getNestedValue(item, searchKey);
              const closestValue = closest ? getNestedValue(closest, searchKey) : null;

              if (currentValue <= value && (closestValue === null || currentValue > closestValue)) {
                  return item;
              }
              return closest;
          }, null)?.[returnKey];

      case 0: // Exact match
          const exactMatch = arr.find(item => getNestedValue(item, searchKey) === value);
          return exactMatch ? getNestedValue(exactMatch, returnKey) : null;

      case 1: // Next highest
          return arr.reduce((closest, item) => {
              const currentValue = getNestedValue(item, searchKey);
              const closestValue = closest ? getNestedValue(closest, searchKey) : null;

              if (currentValue >= value && (closestValue === null || currentValue < closestValue)) {
                  return item;
              }
              return closest;
          }, null)?.[returnKey];

      default:
          throw new Error('Invalid mode. Use: -1 (lowest), 0 (exact), 1 (highest)');
  }
}

function findclosestsimple(value, arr, mode = 0) {
  if (!arr || arr.length === 0) return null;

  switch (mode) {
      case -1: // Next lowest
          return arr.reduce((closest, num) => {
              if (num <= value && (closest === null || num > closest)) {
                  return num;
              }
              return closest;
          }, null);

      case 0: // Exact match
          return arr.includes(value) ? value : null;

      case 1: // Next highest
          return arr.reduce((closest, num) => {
              if (num >= value && (closest === null || num < closest)) {
                  return num;
              }
              return closest;
          }, null);

      default:
          throw new Error('Invalid mode. Use: -1 (lowest), 0 (exact), 1 (highest)');
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function togglejoint() {
  return !LOAN_DETAILS.jointloan;
}

function isjoint() {
  return LOAN_DETAILS.jointloan;
}

function postcodesearch(postcode) {
  return findclosestcomplex(postcode, POSTCODE_TABLE, 'postcode', 'rurality', -1);
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

function ytd(ytdincome, asat, taxyearstart = TAX_YEAR_START) {
  taxyearstart = new Date(Date.parse(taxyearstart));
  asat = new Date(Date.parse(asat));
  const datediff = (asat - taxyearstart) / (1000 * 60 * 60 * 24 * 7);
  const annualincome = (ytdincome / datediff) * 52;

  return formatcurrency(annualincome, -1);
}

async function weeklyhem(income, marital, dependents, postcode, state, partnerincome = 0) {
  // marital: 1 = single, 2 = married / defacto
  const householdincome = income + partnerincome;
  const apportioningratio = income / householdincome;

  try {
    const hemData = await loadHEMData();
    
    const income_band = findclosestsimple(householdincome, INCOME_BANDS, -1);
    const rurality = postcodesearch(postcode);
    
    const key = `${state}_${rurality}_${marital}_${dependents}_${income_band}`;
    
    const hemValue = hemData[key];
    
    if (hemValue === undefined) {
        throw new Error(`No HEM value found for key: ${key}`);
    }
    
    return hemValue * apportioningratio;

} catch (error) {
    console.error('Error in getHEM:', error);
    throw error;
}
}

//const result = await weeklyhem(167432, 2, 8, 6030, 'WA', 78698);
//console.log(formatcurrency(result * frequencyconvert('w', 'm'), 1));