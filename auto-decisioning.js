const DECLINE_RULES = {
    D01: {
        condition: (servicingdata) => servicingdata.cashsurplus < 8.34 
    },

};

const REFER_RULES = {
    R01: {
        condition: (applicantdata, incomedata) => (applicantdata.age < 21 && incomedata.income < 70000) || applicantdata.age >= 65
        
    },

    R02: {
        condition: (servicingdata) => servicingdata.cashsurplus > 8.34
    },

    R03: {
        condition: (creditfiledata) => creditfiledata.enqL4M >= 8
    },

    R08a: {
        condition: (servicingdata, applicantdata) => (servicingdata.dsr >= 0.6 && applicantdata.onescore < 730 && ((applicantdata.residencystatus != 'buyer' || applicantdata.residencystatus != 'owner') || applicantdata.onescore < 540)) || servicingdata.dsr >= 0.8
    },

    R08b: {
        condition: (servicingdata, applicantdata) => (applicantdata.onescore <835 || (applicantdata.onescore < 540 && (applicantdata.residencystatus != buyer || applicantdata.residencystatus != owner))) && servicingdata.dto >= 1.0
    },

};

/*
* const person = { age: 70 };
* const medical = { hasPreExisting: true };
* const insurance = { planType: "Medicare" };
* 
* if (RULES.R01.condition(person, medical, insurance)) {
*     console.log("Rule applies");
* }
*/