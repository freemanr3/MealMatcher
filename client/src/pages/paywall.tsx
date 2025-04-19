import React from 'react';
import { withAuthProtection } from '@/components/auth/withPaywallProtection';
import { PaywallScreen } from '@/components/auth/PaywallScreen';

const PaywallPage: React.FC = () => {
  return <PaywallScreen />;
};

// Wrap with auth protection to ensure only logged-in users see this
export default withAuthProtection(PaywallPage); 