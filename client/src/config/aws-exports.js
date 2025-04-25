// This is an auto-generated file with Amplify configuration
// You can replace this with the actual configuration from your Amplify project
const awsExports = {
  Auth: {
    region: 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || import.meta.env.VITE_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || import.meta.env.VITE_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    mandatorySignIn: false,
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