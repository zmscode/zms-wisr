const DECLINE_RULES = {
    D01: {
        condition: (data) => data.cashsurplus < 8.34 
    },

};

const REFER_RULES = {
    R01: {
        condition: (data) => (data.age < 21 && data.income < 70000) || data.age >= 65
        
    },

    R02: {
        condition: (data) => data.cashsurplus > 8.34
    },

    R03: {
        condition: (data) => data.enqL4M >= 8
    },

    R08a: {
        condition: (data) => (data.dsr >= 0.6 && data.onescore < 730 && ((residencystatus != buyer || residencystatus != owner) || data.onescore < 540)) || data.dsr >= 0.8
    },

    R08b: {
        condition: (data) => (data.onescore <835 || (data.onescore < 540 && (residencystatus != buyer || residencystatus != owner))) && data.dto >= 1.0
    },



};