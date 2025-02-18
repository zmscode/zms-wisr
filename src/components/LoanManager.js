import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useLoan } from '../context/LoanContext';
import { loanService } from '../services/LoanService';

function LoanManager() {
  const { state, dispatch } = useLoan();
  const [searchQuery, setSearchQuery] = useState('');
  const [newLoanId, setNewLoanId] = useState('');
  const [showNewLoanDialog, setShowNewLoanDialog] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const results = await loanService.searchLoans(searchQuery);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCreateNewLoan = async () => {
    if (newLoanId.length === 6 || newLoanId.length === 7) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const newLoan = loanService.createLoanStructure(newLoanId);
        await loanService.saveLoan(newLoan);
        dispatch({ type: 'SET_CURRENT_LOAN', payload: newLoan });
        setShowNewLoanDialog(false);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const loadLoan = async (loanId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const loan = await loanService.getLoan(loanId);
      dispatch({ type: 'SET_CURRENT_LOAN', payload: loan });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
      {/* Search Section */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Loan Search
          </Typography>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Search Loans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter loan ID or search terms..."
            />
            <Button
              type="submit"
              variant="contained"
              disabled={state.loading}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowNewLoanDialog(true)}
            >
              New Loan
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {state.loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Search Results */}
      {state.searchResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            <List>
              {state.searchResults.map((loan) => (
                <ListItem
                  key={loan.loanId}
                  button
                  onClick={() => loadLoan(loan.loanId)}
                >
                  <ListItemText
                    primary={`Loan ID: ${loan.loanId}`}
                    secondary={`Last Updated: ${new Date(loan.lastUpdated).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* New Loan Dialog */}
      <Dialog open={showNewLoanDialog} onClose={() => setShowNewLoanDialog(false)}>
        <DialogTitle>Create New Loan Assessment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Loan ID"
            fullWidth
            value={newLoanId}
            onChange={(e) => setNewLoanId(e.target.value)}
            error={newLoanId.length > 0 && newLoanId.length !== 6 && newLoanId.length !== 7}
            helperText="Please enter a 6 or 7 digit loan ID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewLoanDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNewLoan}
            disabled={newLoanId.length !== 6 && newLoanId.length !== 7}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LoanManager;