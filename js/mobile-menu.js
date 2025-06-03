// This is the content for js/mobile-menu.js
const mobileMenuCheckbox = document.querySelector('#menuToggle input[type="checkbox"]');
const mobileNavLinks = document.querySelectorAll('#menu .nav-link-mobile');

// Check if essential elements are found
if (!mobileMenuCheckbox) {
    console.warn('Mobile menu toggle checkbox not found. Mobile menu click functionality might not work.');
}

// Ensure mobileNavLinks is not null and has items before proceeding
if (!mobileNavLinks || mobileNavLinks.length === 0) {
    console.warn('No mobile navigation links found. Mobile menu click functionality might not work.');
}

// Proceed only if both essential elements are found
if (mobileMenuCheckbox && mobileNavLinks && mobileNavLinks.length > 0) {
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');

            // Always close the menu by unchecking the checkbox
            mobileMenuCheckbox.checked = false;

            // Check if the href is a valid anchor to an element on the page
            if (href && href.startsWith('#') && href.length > 1) {
                const targetId = href.substring(1); // Remove '#'
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    event.preventDefault(); // Prevent default anchor behavior (jumping)
                    
                    // Perform smooth scroll to the target element
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
} else {
    console.warn('Mobile menu event listeners not attached due to missing elements.');
}
