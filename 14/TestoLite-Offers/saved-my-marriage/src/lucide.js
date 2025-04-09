// Import Lucide core and only the specific icons used in the project
import { createIcons } from 'lucide';
import {
  Star,
  StarHalf,
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
  AlertCircle,
  Heart,
  HeartPulse,
  Activity,
  Flame,
  Brain,
  CheckCircle2,
  CheckCircle,
  ArrowRight
} from 'lucide';

// Create a map of icon names to their components
const iconMap = {
  'star': Star,
  'star-half': StarHalf,
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
  'alert-circle': AlertCircle,
  'heart': Heart,
  'heart-pulse': HeartPulse,
  'activity': Activity,
  'flame': Flame,
  'brain': Brain,
  'check-circle-2': CheckCircle2,
  'check-circle': CheckCircle,
  'arrow-right': ArrowRight
};

// Initialize icons when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  createIcons({ icons: iconMap });
  console.log('Lucide icons initialized from optimized bundle');
});
