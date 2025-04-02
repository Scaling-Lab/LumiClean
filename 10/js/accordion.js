/**
 * Initialize the accordion functionality for the FAQ section
 */
function initAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const header = item.querySelector(".faq-header");

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

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".faq-item")) {
    initAccordion();
  }
});
