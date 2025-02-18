import { v4 as uuidv4 } from 'uuid';

class LoanService {
  constructor() {
    this.storageKey = 'loan_assessments';
  }

  // Create new loan structure
  createLoanStructure(loanId) {
    return {
      loanId,
      lastUpdated: new Date().toISOString(),
      status: 'active',
      applicant: {
        declared: {
          income: 0,
          expenses: 0,
          liabilities: []
        },
        verified: {
          income: 0,
          expenses: 0,
          liabilities: []
        }
      },
      notes: [],
      changes: [],
      documents: []
    };
  }

  // Save loan data
  async saveLoan(loanData) {
    try {
      const loans = await this.getAllLoans();
      const existingIndex = loans.findIndex(loan => loan.loanId === loanData.loanId);
      
      if (existingIndex >= 0) {
        loans[existingIndex] = {
          ...loanData,
          lastUpdated: new Date().toISOString()
        };
      } else {
        loans.push({
          ...loanData,
          lastUpdated: new Date().toISOString()
        });
      }

      localStorage.setItem(this.storageKey, JSON.stringify(loans));
      return true;
    } catch (error) {
      console.error('Error saving loan:', error);
      throw new Error('Failed to save loan data');
    }
  }

  // Get a specific loan
  async getLoan(loanId) {
    try {
      const loans = await this.getAllLoans();
      return loans.find(loan => loan.loanId === loanId) || null;
    } catch (error) {
      console.error('Error retrieving loan:', error);
      throw new Error('Failed to retrieve loan data');
    }
  }

  // Get all loans
  async getAllLoans() {
    try {
      const loansJson = localStorage.getItem(this.storageKey);
      return loansJson ? JSON.parse(loansJson) : [];
    } catch (error) {
      console.error('Error retrieving loans:', error);
      throw new Error('Failed to retrieve loans');
    }
  }

  // Search loans
  async searchLoans(query) {
    try {
      const loans = await this.getAllLoans();
      const searchTerm = query.toLowerCase();
      
      return loans.filter(loan => 
        loan.loanId.includes(searchTerm) ||
        loan.notes.some(note => 
          note.content.toLowerCase().includes(searchTerm)
        )
      );
    } catch (error) {
      console.error('Error searching loans:', error);
      throw new Error('Failed to search loans');
    }
  }

  // Add a note
  async addNote(loanId, { content, category, author }) {
    try {
      const loan = await this.getLoan(loanId);
      if (!loan) throw new Error('Loan not found');

      const newNote = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        content,
        category,
        author
      };

      loan.notes.push(newNote);
      await this.saveLoan(loan);
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw new Error('Failed to add note');
    }
  }

  // Record a change
  async recordChange(loanId, { field, oldValue, newValue, reason }) {
    try {
      const loan = await this.getLoan(loanId);
      if (!loan) throw new Error('Loan not found');

      const change = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        field,
        oldValue,
        newValue,
        reason
      };

      loan.changes.push(change);
      await this.saveLoan(loan);
      return change;
    } catch (error) {
      console.error('Error recording change:', error);
      throw new Error('Failed to record change');
    }
  }
}

export const loanService = new LoanService();