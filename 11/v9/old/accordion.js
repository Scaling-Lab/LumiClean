document.addEventListener('DOMContentLoaded', function() {
  const featureCards = document.querySelectorAll('.feature-card-v9');
  
  // Set first card as active by default
  featureCards[0].classList.add('active');
  featureCards[0].classList.add('faq-item-open');
  
  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove active and open classes from all cards
      featureCards.forEach(c => {
        c.classList.remove('active');
        c.classList.remove('faq-item-open');
      });
      
      // Add active and open classes to clicked card
      card.classList.add('active');
      card.classList.add('faq-item-open');
    });
  });
}); 