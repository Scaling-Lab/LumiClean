// Import only the icons we use in the project
import { createIcons, X, Plus, Minus, ShoppingCart, Heart, User, AlertCircle } from 'lucide';

// Create an icons map for exports and createIcons calls
const icons = { X, Plus, Minus, ShoppingCart, Heart, User, AlertCircle };

// Export the icons we need
export { createIcons, X, Plus, Minus, ShoppingCart, Heart, User, AlertCircle, icons };

// Initialize icons automatically when this file is imported
window.addEventListener('DOMContentLoaded', () => {
  createIcons({
    icons: {
      X,
      Plus,
      Minus,
      ShoppingCart,
      Heart,
      User,
      AlertCircle
    }
  });
});

// Make available globally for dynamic icon creation, including icons map for cart.js
window.lucide = {
  createIcons,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  User,
  AlertCircle,
  icons: {
    X,
    Plus,
    Minus,
    ShoppingCart,
    Heart,
    User,
    AlertCircle
  }
}; 