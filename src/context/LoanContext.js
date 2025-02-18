import React, { createContext, useContext, useReducer } from 'react';

const LoanContext = createContext();

const initialState = {
  currentLoan: null,
  searchResults: [],
  loading: false,
  error: null
};

function loanReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_LOAN':
      return {
        ...state,
        currentLoan: action.payload,
        error: null
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
}

export function LoanProvider({ children }) {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  return (
    <LoanContext.Provider value={{ state, dispatch }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoan() {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
}