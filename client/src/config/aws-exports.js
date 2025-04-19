const awsExports = {
  Auth: {
    // Replace these with your actual values from Amplify Console after setup
    region: 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || import.meta.env.VITE_USER_POOL_ID || 'AMPLIFY_CONFIGURED_USER_POOL_ID',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || import.meta.env.VITE_USER_POOL_CLIENT_ID || 'AMPLIFY_CONFIGURED_CLIENT_ID',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',
    signUpAttributes: ['email'],
    usernameAttributes: ['email'],
    mfaConfiguration: 'OPTIONAL',
    mfaTypes: ['TOTP'],
    passwordProtectionSettings: {
      passwordPolicyMinLength: 8,
      passwordPolicyCharacters: []
    },
    verificationMechanisms: ['EMAIL']
  }
};

export default awsExports; 