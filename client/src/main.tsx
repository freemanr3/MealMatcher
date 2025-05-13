import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './config/aws-exports';

// Initialize AWS Amplify
function initializeAmplify() {
  try {
    // Function to check if aws-exports contains placeholder values
    const isValidAwsConfig = () => {
      const { aws_user_pools_id, aws_user_pools_web_client_id } = awsconfig;
      return (
        aws_user_pools_id && 
        aws_user_pools_web_client_id && 
        !aws_user_pools_id.includes('XXXXXXXXX') &&
        !aws_user_pools_web_client_id.includes('XXXXXXXXX')
      );
    };

    // Only initialize Amplify if valid config exists
    if (isValidAwsConfig()) {
      console.log('Initializing Amplify with valid configuration');
      Amplify.configure(awsconfig);
    } else {
      console.warn('AWS Amplify not initialized: Invalid or placeholder configuration detected');
    }
  } catch (error) {
    console.error('Error initializing AWS Amplify:', error);
  }
}

// Call the initialize function
initializeAmplify();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);