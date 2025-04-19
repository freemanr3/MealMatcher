# AWS Amplify Deployment Guide

## Prerequisites
- AWS Account
- GitHub repository with your PantryPal code
- AWS Amplify CLI installed (optional for local development)

## Step 1: Configure Environment Variables in AWS Amplify Console

When deploying your application to AWS Amplify, you need to set the following environment variables in the Amplify Console:

1. **VITE_USER_POOL_ID**: Your Cognito User Pool ID
2. **VITE_USER_POOL_CLIENT_ID**: Your Cognito User Pool Client ID
3. **VITE_SPOONACULAR_API_KEY**: Your Spoonacular API key

To set these variables:
1. Navigate to the AWS Amplify Console
2. Select your app
3. Go to "App settings" > "Environment variables"
4. Add each of the above variables and their values

## Step 2: Connect Repository to AWS Amplify

1. Log in to the AWS Management Console and navigate to AWS Amplify
2. Click "New app" > "Host web app"
3. Choose GitHub (or your preferred Git provider)
4. Authorize AWS Amplify to access your repository
5. Select your PantryPal repository and branch
6. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd client
        - npm install
    build:
      commands:
        - cd client
        - npm run build
  artifacts:
    baseDirectory: client/dist
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
```

7. Click "Save and deploy"

## Step 3: Update Redirect/Rewrite Settings

For a single-page application (SPA), configure redirect settings:
1. In the Amplify Console, go to "App settings" > "Rewrites and redirects"
2. Add the following rule:
   - Source address: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - Target address: `/index.html`
   - Type: `200 (Rewrite)`

## Step 4: Test Authentication Flow

After deployment, test the authentication flow:
1. Navigate to your deployed app URL
2. Try to access a protected route - you should be redirected to the login page
3. Sign up with a new account
4. Verify your email using the code sent
5. Log in with your credentials
6. You should be redirected to the paywall page

## Troubleshooting

- If authentication fails, check the environment variables in the Amplify Console
- Review CloudWatch logs for any errors
- Check the browser console for client-side errors
- Ensure your Cognito User Pool is configured correctly with email as the login mechanism

## Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify Authentication Guide](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [Amplify Hosting Documentation](https://docs.amplify.aws/guides/hosting/amplify-console/q/platform/js/) 