import React, { createContext, useContext, useReducer, useEffect } from 'react';

const LoanContext = createContext();

const initialState = {
  loans: [
    {
      id: 1,
      name: 'Primary Mortgage',
      type: 'mortgage',
      balance: 285000,
      originalAmount: 320000,
      interestRate: 3.25,
      monthlyPayment: 1392.50,
      dueDate: '2024-01-15',
      term: 360,
      remainingTerm: 312,
      minimumPayment: 1392.50,
      isActive: true,
      startDate: '2020-01-15'
    },
    {
      id: 2,
      name: 'Credit Card - Chase',
      type: 'credit_card',
      balance: 8500,
      originalAmount: 8500,
      interestRate: 18.99,
      monthlyPayment: 255,
      dueDate: '2024-01-10',
      minimumPayment: 170,
      creditLimit: 15000,
      isActive: true,
      startDate: '2023-06-01'
    },
    {
      id: 3,
      name: 'Auto Loan - Honda',
      type: 'auto',
      balance: 22500,
      originalAmount: 28000,
      interestRate: 4.5,
      monthlyPayment: 520,
      dueDate: '2024-01-20',
      term: 60,
      remainingTerm: 48,
      minimumPayment: 520,
      isActive: true,
      startDate: '2022-08-01'
    },
    {
      id: 4,
      name: 'Personal Loan',
      type: 'personal',
      balance: 12000,
      originalAmount: 15000,
      interestRate: 12.5,
      monthlyPayment: 450,
      dueDate: '2024-01-25',
      term: 36,
      remainingTerm: 28,
      minimumPayment: 450,
      isActive: true,
      startDate: '2023-01-01'
    }
  ],
  paymentHistory: [],
  settings: {
    defaultStrategy: 'avalanche',
    notifications: {
      dueDateReminders: true,
      lowBalanceAlerts: true,
      paymentConfirmations: true
    }
  }
};

function loanReducer(state, action) {
  switch (action.type) {
    case 'ADD_LOAN':
      return {
        ...state,
        loans: [...state.loans, { ...action.payload, id: Date.now() }]
      };
    
    case 'UPDATE_LOAN':
      return {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.id ? { ...loan, ...action.payload } : loan
        )
      };
    
    case 'DELETE_LOAN':
      return {
        ...state,
        loans: state.loans.filter(loan => loan.id !== action.payload)
      };
    
    case 'ADD_PAYMENT':
      return {
        ...state,
        paymentHistory: [...state.paymentHistory, action.payload],
        loans: state.loans.map(loan => {
          if (loan.id === action.payload.loanId) {
            return {
              ...loan,
              balance: Math.max(0, loan.balance - action.payload.amount)
            };
          }
          return loan;
        })
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    default:
      return state;
  }
}

export const LoanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('loanManagerState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        Object.keys(parsedState).forEach(key => {
          if (key !== 'loans') return;
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
        });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('loanManagerState', JSON.stringify(state));
  }, [state]);

  const addLoan = (loan) => {
    dispatch({ type: 'ADD_LOAN', payload: loan });
  };

  const updateLoan = (loan) => {
    dispatch({ type: 'UPDATE_LOAN', payload: loan });
  };

  const deleteLoan = (loanId) => {
    dispatch({ type: 'DELETE_LOAN', payload: loanId });
  };

  const addPayment = (payment) => {
    dispatch({ type: 'ADD_PAYMENT', payload: payment });
  };

  const updateSettings = (settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const getTotalDebt = () => {
    return state.loans.reduce((total, loan) => total + loan.balance, 0);
  };

  const getTotalMonthlyPayments = () => {
    return state.loans.reduce((total, loan) => total + loan.monthlyPayment, 0);
  };

  const getHighestInterestLoan = () => {
    return state.loans.reduce((highest, loan) => 
      loan.interestRate > (highest?.interestRate || 0) ? loan : highest, null
    );
  };

  const getSmallestBalanceLoan = () => {
    return state.loans.reduce((smallest, loan) => 
      loan.balance < (smallest?.balance || Infinity) ? loan : smallest, null
    );
  };

  const value = {
    ...state,
    addLoan,
    updateLoan,
    deleteLoan,
    addPayment,
    updateSettings,
    getTotalDebt,
    getTotalMonthlyPayments,
    getHighestInterestLoan,
    getSmallestBalanceLoan
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
};