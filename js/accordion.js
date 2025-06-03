/**
 * Initialize the accordion functionality for the FAQ section
 */
function initAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems || faqItems.length === 0) {
    console.warn('Accordion items (.faq-item) not found. Accordion not initialized.');
    return;
  }

  faqItems.forEach((item) => {
    const header = item.querySelector(".faq-header");
    if (!header) {
      console.warn('Accordion header (.faq-header) not found for an item. Skipping this item.');
      return;
    }

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("faq-item-open");

      // Close all items
      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("faq-item-open");
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add("faq-item-open");
      }
    });
  });
}

// Call initAccordion directly when the module is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccordion);
} else {
  initAccordion();
}
