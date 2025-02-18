import React from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline 
} from '@mui/material';
import { LoanProvider } from './context/LoanContext';
import Layout from './components/layout/Layout';
import LoanManager from './components/LoanManager';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#0288d1',
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoanProvider>
        <Layout>
          <LoanManager />
        </Layout>
      </LoanProvider>
    </ThemeProvider>
  );
}

export default App;