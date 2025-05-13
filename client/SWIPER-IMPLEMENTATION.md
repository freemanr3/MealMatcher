# Recipe Swiper Interaction Implementation

This document explains the implementation of the Tinder-like swipe interaction for browsing recipes in the PantryPal application.

## 📱 Features

- **Intuitive Swipe Interactions**:
  - 👉 Swipe right to add a recipe to your meal plan
  - 👈 Swipe left to skip a recipe
  - 🖱️ Button alternatives for desktop users

- **Rich Visual Feedback**:
  - ✅ Green checkmark overlay appears when swiping right
  - ❌ Red X overlay appears when swiping left
  - 🔄 Smooth card transition animations with spring physics
  - 📚 "Card stack" appearance for a tactile feel
  - 📳 Haptic feedback on mobile devices (when available)

- **User Experience Improvements**:
  - 🔄 Pre-loading of next recipe for instant transitions
  - 👋 First-time user instructions overlay
  - 🎯 Visual cues showing swipe progress
  - 🎨 Aesthetic animations and transitions

## 🔧 Technical Implementation

### Core Technologies

- **Framer Motion**: For fluid, physics-based animations
- **React Hooks**: For state management and lifecycle events
- **LocalStorage**: For saving meal plan recipes
- **Haptic Feedback API**: For tactile response on mobile

### Key Components

1. **MealSwiper**: Main component for the swiping interface
2. **RecipeCard**: Presentational component for recipe information
3. **useMealPlan**: Custom hook for managing saved recipes

### Animation Details

- **Card Stacking**: Using layered, statically positioned cards with scale and rotation transforms
- **Swipe Physics**: Spring animations with customized damping and stiffness for natural feel
- **Overlay Icons**: Opacity controlled dynamically based on swipe distance
- **Exit Animations**: Direction-based exit animations depending on swipe action

### Usage Example

```jsx
// Adding the swiper to your page
import { MealSwiper } from '@/pages/meal-swiper';

function App() {
  return (
    <div className="app">
      <MealSwiper />
    </div>
  );
}
```

## 🎯 Future Improvements

- Multi-direction swipe (up/down) for additional actions
- Undo functionality for accidental swipes
- More granular haptic feedback patterns
- Drag resistance based on recipe compatibility with user preferences
- Animation performance optimizations for lower-end devices
- Accessibility improvements for keyboard navigation

## 🔄 How It Works

1. User is presented with a recipe card
2. User can:
   - Swipe right to add to meal plan
   - Swipe left to skip
   - Click buttons below for the same actions
3. Visual overlay indicates the action being taken
4. Card animates off-screen in the appropriate direction
5. Next card appears with a smooth transition
6. Toast notification confirms when a recipe is added to meal plan

## 🛠️ Implementation Notes

The swiping mechanism is built using Framer Motion's drag gesture handling. We calculate the swipe distance and direction, then trigger the appropriate action when the swipe exceeds the threshold. The animation state is managed using Framer Motion's `AnimatePresence` and motion values.

Haptic feedback is provided on supporting devices using the browser's Vibration API. This enhances the tactile feel of the interaction, making it more engaging and intuitive.

Recipe data is efficiently managed to minimize loading times. The next recipe is preloaded while the user is viewing the current one, ensuring a smooth experience even with network latency. 