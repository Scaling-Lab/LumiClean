// Import Lucide core and only the specific icons used in the project
import { createIcons } from 'lucide';
import {
  CheckCircle,
  Star,
  X,
  BatteryCharging,
  Dumbbell,
  Zap,
  BrainCircuit,
  Clock,
  Target,
  Smartphone,
  Timer,
  Briefcase,
  Award,
  Check,
  Gift,
  BookOpen,
  Headphones,
  ShoppingCart,
  ShieldCheck,
  Minus,
  Plus,
  Trash2,
  Truck,
  Lock,
  AlertCircle
} from 'lucide';

// Create a map of icon names to their components
const iconMap = {
  'check-circle': CheckCircle,
  'star': Star,
  'x': X,
  'battery-charging': BatteryCharging,
  'dumbbell': Dumbbell,
  'zap': Zap,
  'brain-circuit': BrainCircuit,
  'clock': Clock,
  'target': Target,
  'smartphone': Smartphone,
  'timer': Timer,
  'briefcase': Briefcase,
  'award': Award,
  'check': Check,
  'gift': Gift,
  'book-open': BookOpen,
  'headphones': Headphones,
  'shopping-cart': ShoppingCart,
  'shield-check': ShieldCheck,
  'minus': Minus,
  'plus': Plus,
  'trash-2': Trash2,
  'truck': Truck,
  'lock': Lock,
  'alert-circle': AlertCircle
};

// Initialize icons when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  createIcons({ icons: iconMap });
  console.log('Lucide icons initialized from optimized bundle');
}); 