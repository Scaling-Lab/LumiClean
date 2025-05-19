    // build-icons.mjs
    import * as esbuild from 'esbuild';
    // IMPORTANT: Import EVERY Lucide icon used in index.html here by its PascalCase name
    // Add or remove icons from this import list as needed if your HTML changes.
    import { 
        // Import ALL icons used across ALL pages initially
        createIcons, 
        // Common Icons (used in multiple pages)
        Check, Star, StarHalf, X, BatteryCharging, Dumbbell, Zap, BrainCircuit, Clock, Target, Smartphone, Timer, Briefcase, Award, 
        Gift, BookOpen, Headphones, ShoppingCart, ShieldCheck, Lock, Truck, Minus, Plus, Trash2, 
        // manhood-reboot specific (or mostly specific)
        CheckCircle, AlertCircle,
        // young-at-52 specific (or mostly specific)
        Flame, CheckCircle2, XCircle, Activity, Heart, HeartPulse, Coffee, Newspaper, Mail, Tv, ChevronDown, AlertTriangle, Loader2, Brain,
        // saved-my-marriage specific (or mostly specific)
        ArrowRight
    } from 'lucide';

    // Define icons specifically for manhood-reboot
    const manhoodIcons = { 
        CheckCircle, Check, Star, X, BatteryCharging, Dumbbell, Zap, BrainCircuit, Clock, Target, Smartphone, Timer, Briefcase, Award, 
        Gift, BookOpen, Headphones, ShoppingCart, ShieldCheck, AlertCircle, Lock, Truck, Minus, Plus, Trash2
    };
    const manhoodIconNames = Object.keys(manhoodIcons);

    // Define icons specifically for young-at-52
    const youngAt52Icons = {
        CheckCircle2, Star, XCircle, Check, Zap, Activity, Heart, BrainCircuit, Dumbbell, Coffee, Newspaper, Mail, Tv, ChevronDown, 
        Truck, ShieldCheck, Lock, AlertTriangle, X, Loader2, ShoppingCart, Flame, Brain, AlertCircle, Minus, Plus, Trash2
    };
    const youngAt52IconNames = Object.keys(youngAt52Icons);

    // Define icons specifically for saved-my-marriage
    const savedMyMarriageIcons = {
        Star, StarHalf, X, BatteryCharging, Dumbbell, Zap, BrainCircuit, Clock, Target, Smartphone, Timer, Briefcase, Award, 
        Check, Gift, BookOpen, Headphones, ShoppingCart, ShieldCheck, Minus, Plus, Trash2, Truck, Lock, AlertCircle,
        Heart, HeartPulse, Activity, Flame, Brain, CheckCircle, CheckCircle2, ArrowRight
    };
    const savedMyMarriageIconNames = Object.keys(savedMyMarriageIcons);

    // --- Helper function to generate esbuild input code ---
    const generateInputCode = (iconNames) => `
      // This code runs inside the final bundle
      import { createIcons as ci, ${iconNames.join(', ')} } from 'lucide';

      // Define the icons map containing only the imported icons
      const icons = { ${iconNames.join(', ')} };

      // Expose createIcons globally, automatically injecting our specific icons
      window.lucide = {
          createIcons: (opts) => ci({ ...opts, icons }) 
      };

      // Automatically run createIcons when the DOM is ready
      const runCreateIcons = () => {
          console.log('Running optimized lucide.createIcons for this page...');
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons(); 
          } else {
            console.error('Lucide context not found or createIcons is not a function.');
          }
      }

      if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', runCreateIcons);
      } else {
          runCreateIcons();
      }
    `;

    // --- Build Configuration Function ---
    const buildBundle = async (outfile, iconNames) => {
        const inputCode = generateInputCode(iconNames);
        try {
            await esbuild.build({
                stdin: {
                    contents: inputCode,
                    resolveDir: '.', // Helps esbuild find 'lucide' in node_modules
                    loader: 'js',
                },
                outfile: outfile,
                bundle: true,
                minify: true,
                format: 'iife',
            });
            console.log(`✅ Lucide icon bundle generated successfully at: ${outfile}`);
        } catch (error) {
            console.error(`❌ Error building Lucide icon bundle for ${outfile}:`, error);
            process.exit(1); // Exit with error code if build fails
        }
    };

    // --- Run builds for all pages ---
    (async () => {
        await buildBundle('manhood-reboot/_js/lucide-bundle._js', manhoodIconNames);
        await buildBundle('young-at-52/_js/lucide-bundle._js', youngAt52IconNames);
        await buildBundle('saved-my-marriage/_js/lucide-bundle._js', savedMyMarriageIconNames);
    })();