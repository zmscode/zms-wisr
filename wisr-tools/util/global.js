// GLOBAL
export const ERROR_CODE = -Infinity;
export const FREQUENCY_CODES = ['w', 'f', 'm', 'y'];

// MATHEMATICAL
export const PRECISION_LEVEL = [
    [1, 0.1], 
    [2, 0.01],
];

export const CURR_MAX_VALUE = Math.pow(10, 9) - 1; // Maximum value for currency input ($999,999,999)

export const NAT1004COEFFS = [
    [361, 0, 0],
    [500, 0.16, 57.8462],
    [625, 0.26, 107.8462],
    [721, 0.18, 57.8462],
    [865, 0.189, 64.3365],
    [1282, 0.3227, 180.0385],
    [2596, 0.32, 176.5769],
    [3653, 0.39, 358.3077],
    [CURR_MAX_VALUE, 0.47, 650.6154] 
];



// SPECIFICALLY FOR THE TAX TOOL
export const TAX_TOOL = {
    CURR_MAX_VALUE,
    INIT_GROSS_GUESS,

};
