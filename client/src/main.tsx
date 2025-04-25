import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import './index.css';
import awsExports from './config/aws-exports';

// Configure Amplify
Amplify.configure(awsExports);

// Custom theme to match PantryPal branding
const theme = {
  name: 'pantrypal-theme',
  tokens: {
    colors: {
      brand: {
        primary: { value: '#FF6B35' }, // Orange color for PantryPal
        secondary: { value: '#4CB963' }, // Green accent
      },
      background: {
        primary: { value: '#FFFFFF' },
        secondary: { value: '#FFF0E6' }, // Light orange background
      },
      font: {
        interactive: { value: '#FF6B35' },
      },
    },
    fonts: {
      default: {
        variable: { value: 'Inter, sans-serif' },
      },
    },
    components: {
      button: {
        primary: {
          backgroundColor: { value: '{colors.brand.primary.value}' },
          _hover: {
            backgroundColor: { value: '#E55A24' }, // Darker orange on hover
          },
        },
      },
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);