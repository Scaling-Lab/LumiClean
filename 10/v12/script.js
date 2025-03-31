/**
 * Initialize the accordion functionality for the FAQ section
 */
function initAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const header = item.querySelector(".faq-header");
    const icon = item.querySelector(".faq-icon");

    header.addEventListener("click", () => {
      // Check if this item is already open
      const isOpen = item.classList.contains("faq-item-open");

      // Close all items first
      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("faq-item-open");
        const faqIcon = faqItem.querySelector(".faq-icon");

        // Reset all icons to default state (closed)
        if (faqIcon) {
          faqIcon
            .querySelector("path:nth-child(1)")
            .setAttribute("fill", "#EAEAEA");
          faqIcon
            .querySelector("path:nth-child(2)")
            .setAttribute("fill", "#EAEAEA");
          faqIcon
            .querySelector("path:nth-child(3)")
            .setAttribute(
              "d",
              "M20.3037 12.6073L15 17.9098L9.69621 12.6073L11.4637 10.8398L15 14.3748L18.535 10.8398L20.3037 12.6073Z",
            );
        }
      });

      // If the clicked item wasn't open, open it
      if (!isOpen) {
        item.classList.add("faq-item-open");

        // Change icon to active state
        icon.querySelector("path:nth-child(1)").setAttribute("fill", "#1890D5");
        icon.querySelector("path:nth-child(2)").setAttribute("fill", "#1890D5");
        icon
          .querySelector("path:nth-child(3)")
          .setAttribute(
            "d",
            "M20.3037 16.1427L15 10.8402L9.69621 16.1427L11.4637 17.9102L15 14.3752L18.535 17.9102L20.3037 16.1427Z",
          );
      }
    });
  });
}

// If the script is loaded directly (not via fetch in index.html)
document.addEventListener("DOMContentLoaded", function () {
  // Check if the accordion is already on the page
  if (document.querySelector(".faq-item") && !window.accordionInitialized) {
    initAccordion();
    window.accordionInitialized = true;
  }
});
