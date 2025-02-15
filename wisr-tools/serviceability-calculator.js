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

const HEM_VALUES = {
  INCOME_BANDS: [
    { threshold: 0, index: 1},
    { threshold: 26000, index: 2},
    { threshold: 39000, index: 3},
    { threshold: 52000, index: 4},
    { threshold: 64000, index: 5},
    { threshold: 77000, index: 6},
    { threshold: 103000, index: 7},
    { threshold: 129000, index: 8},
    { threshold: 155000, index: 9},
    { threshold: 180000, index: 10},
    { threshold: 206000, index: 11},
    { threshold: 258000, index: 12},
    { threshold: 322000, index: 13},
    { threshold: 386000, index: 14},
    { threshold: 644000, index: 15}
  ] 
}

const POSTCODES = {
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

console.log(process.cwd());

const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('./yourfile.csv').pipe(csv()).on('data', (data) => results.push(data)).on('end', () => {console.log(results); });


function lookup(value, array, lookupProperty, returnProperty, matchMode = 0) {
  let index = -1;
  
  if (matchMode === 0) {
      index = array.findIndex(item => item[lookupProperty] === value);
  } else {
      for (let i = 0; i < array.length; i++) {
          const currentValue = array[i][lookupProperty];
          if (matchMode === -1 && currentValue <= value) {
              index = i;
          } else if (matchMode === 1 && currentValue >= value) {
              index = i;
              break;
          }
      }
  }
  
  return index !== -1 ? array[index][returnProperty] : undefined;
}

// console.log(lookup(2000, POSTCODES.POSTCODE_TABLE, 'postcode', 'rurality', -1));