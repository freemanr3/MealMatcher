# PantryPal

PantryPal is a meal planning application that helps users discover recipes based on ingredients they have on hand, plan meals, and reduce food waste.

## Features

- User authentication via AWS Cognito
- Recipe discovery based on available ingredients
- Meal planning functionality
- Ingredient management
- Responsive design for desktop and mobile

## Technology Stack

- Frontend: React with TypeScript
- UI: Custom components with Tailwind CSS
- Authentication: AWS Cognito
- API: RESTful backend
- State Management: React Context API and React Query

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS account (for Cognito authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PantryPal.git
   cd PantryPal
   ```

2. Install dependencies:
   ```bash
   cd client
   npm install
   ```

3. Configure AWS Cognito:
   - Follow the instructions in `client/src/AWS_COGNITO_SETUP.md` to set up an AWS Cognito User Pool
   - Update the configuration in `client/src/config/aws-exports.js` with your AWS credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The application should now be running at `http://localhost:5173` (or another port if specified)

## AWS Cognito Authentication

This application uses AWS Cognito for user authentication. Key features include:

- User registration with email verification
- User login with username/email and password
- Secure token-based authentication
- Password recovery

For detailed setup instructions, refer to `client/src/AWS_COGNITO_SETUP.md`.

## Development

### Project Structure

```
client/
├── public/            # Static assets
├── src/
│   ├── components/    # UI components
│   ├── config/        # Configuration files
│   ├── context/       # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── styles/        # Global styles
└── ...                # Config files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

🍽️ Pantry Pal - Swipe Right on Dinner!

Pantry Pal is a Tinder-like meal planning app that helps users discover meal ideas based on the ingredients they already have at home. With a fun swipe interface, users can match with recipes tailored to their pantry, dietary restrictions, and preferences. Pantry Pal helps reduce food waste, inspire creativity in the kitchen, and make meal planning easy and enjoyable.

📱 Features

Core Features
🥕 Ingredient-Based Meal Matching: Enter ingredients you already have and swipe through meal ideas that match.
🍽️ Swipe to Save Recipes: Swipe right to save meals to your meal plan, swipe left to skip.
🌱 Dietary Preferences: Set preferences like vegetarian, vegan, gluten-free, keto, and more.
📊 Simple Nutritional Info: View basic nutrition information for each meal.
🛒 Smart Shopping List: Automatically generates a shopping list for missing ingredients.
Premium Features (Subscription)
📸 Ingredient Scanner: Use your phone's camera to scan items directly into your ingredient list.
🧑‍🍳 AI Chef Suggestions: Personalized tips and ingredient swaps for each recipe.
🍱 Meal Prep Planner: Weekly meal plans based on your pantry and dietary goals.
📊 Detailed Nutritional Breakdown: Full macro and calorie analysis for each recipe.
📚 Exclusive Chef Recipes: Premium access to recipes curated by professional chefs.
⚠️ Advanced Allergen Filtering: Filter meals by allergens (nuts, dairy, shellfish, etc.).
👨‍👩‍👧‍👦 Family & Friends Meal Matching: Sync with friends or family to vote on meals together.
♻️ Leftover Makeover Mode: Creative suggestions for meals using near-expiry ingredients.
🌎 Seasonal Suggestions: Get recipes based on seasonal and local ingredients.
🛠️ Tech Stack

Layer	Technology (suggested examples)
Frontend	React Native / Flutter (cross-platform)
Backend	Node.js / Django (API for recipes & user data)
Database	MongoDB / PostgreSQL
AI Integration	OpenAI API (for smart meal suggestions)
Image Recognition	Google Cloud Vision API (for ingredient scanning)
Hosting	AWS / Heroku / Firebase
Authentication	Firebase Auth / OAuth
