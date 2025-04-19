# AWS Amplify Auth Setup Instructions

After deploying your app to AWS Amplify, follow these steps to complete the authentication setup:

## 1. Install Amplify CLI (if not already done)

```bash
npm install -g @aws-amplify/cli
```

## 2. Initialize Amplify in your project

```bash
amplify init
```

Follow the prompts to initialize your project.

## 3. Add Authentication

```bash
amplify add auth
```

When prompted, choose the following options:

- **Default authentication and security configuration**: Manual configuration
- **User Sign-Up & Sign-In options**: Email and Phone Number
- **MFA**: Optional (TOTP)
- **Email verification**: Required
- **Phone verification**: Required
- **User attributes**: Don't add any custom attributes (skip)
- **Password requirements**: Default settings or customize as needed

## 4. Push your changes to the cloud

```bash
amplify push
```

This will create the necessary resources in AWS (Cognito User Pool, etc.)

## 5. Update your aws-exports.js file

After running `amplify push`, a new `aws-exports.js` file will be generated. Replace the placeholder file at `client/src/config/aws-exports.js` with the content from this generated file.

## 6. Test Authentication

1. Deploy your app
2. Try to sign up with an email or phone number
3. Verify code sent via email/SMS
4. Login with credentials
5. You should be redirected to the paywall screen
6. Use the promo code "FREEMEAL" to bypass payment or set up Stripe (see below)

## 7. Stripe Integration (Optional)

To fully implement Stripe payment:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys
3. Install Stripe packages:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

4. Update the PaywallScreen.tsx file with actual Stripe integration code
5. Create a serverless function to handle Stripe payments (you can use AWS Lambda for this)

## 8. Configure Amplify Hosting

In the AWS Amplify Console:

1. Go to "Hosting environments"
2. Make sure the build settings are correctly pointing to your client directory
3. Under "Environment variables", add any necessary variables (e.g., `VITE_STRIPE_PUBLIC_KEY` if using Stripe)

## 9. Domain Setup

1. Go to "Domain management" in the Amplify Console
2. Add your custom domain if desired
3. Set up SSL certificates

## Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Stripe Documentation](https://stripe.com/docs) 