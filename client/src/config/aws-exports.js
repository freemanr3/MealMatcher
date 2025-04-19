const awsExports = {
  Auth: {
    // Replace these with your actual values from Amplify Console after setup
    region: 'us-east-1',
    userPoolId: 'REPLACE_WITH_USER_POOL_ID',
    userPoolWebClientId: 'REPLACE_WITH_USER_POOL_CLIENT_ID',
    mandatorySignIn: false,
    authenticationFlowType: 'USER_SRP_AUTH',
    signUpAttributes: ['email', 'phone_number'],
    usernameAttributes: ['email', 'phone_number'],
    mfaConfiguration: 'OPTIONAL',
    mfaTypes: ['SMS'],
    passwordProtectionSettings: {
      passwordPolicyMinLength: 8,
      passwordPolicyCharacters: []
    },
    verificationMechanisms: ['EMAIL', 'PHONE_NUMBER']
  }
};

export default awsExports; 