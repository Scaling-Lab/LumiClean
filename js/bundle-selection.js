// document.addEventListener('DOMContentLoaded', function() {
//   // Handle bundle selection with enhanced visual feedback
//   const bundleRadios = document.querySelectorAll('input[name="bundle"]');
//   const bundleLabels = document.querySelectorAll('label[data-variant-id]');
//
//   // Function to add visual highlight to selected bundle
//   function updateSelectedBundle() {
//     bundleLabels.forEach(label => {
//       const radio = label.querySelector('input[type="radio"]');
//       if (radio.checked) {
//         // Add additional visual cues for the selected bundle
//         label.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2');
//         label.style.transform = 'scale(1.02)';
//         label.style.transition = 'all 0.2s ease';
//       } else {
//         // Remove visual cues from unselected bundles
//         label.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2');
//         label.style.transform = 'scale(1)';
//       }
//     });
//   }
//
//   // Add click handler to all bundle options
//   bundleLabels.forEach(label => {
//     label.addEventListener('click', function() {
//       const radio = this.querySelector('input[type="radio"]');
//       radio.checked = true;
//
//       // Update visual state
//       updateSelectedBundle();
//
//       // Optional: add a subtle animation effect
//       this.classList.add('scale-105');
//       setTimeout(() => {
//         this.classList.remove('scale-105');
//       }, 200);
//     });
//   });
//
//   // Initial state
//   updateSelectedBundle();
// });