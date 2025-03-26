(() => {
  const state = {
    isLampSafeOpen: false,
    isScamOpen: false,
    isDifferentOpen: false,
    isMoldOpen: false,
    isAllergensOpen: false,
    isBulbOpen: false,
    isPotencyOpen: false,
    isPersonalItemsOpen: false,
    toggleFaq(faqKey) {
      state[faqKey] = !state[faqKey];
      update();
    },
  };

  let nodesToDestroy = [];
  let pendingUpdate = false;

  function destroyAnyNodes() {
    // destroy current view template refs before rendering again
    nodesToDestroy.forEach((el) => el.remove());
    nodesToDestroy = [];
  }

  // Function to update data bindings and loops
  function update() {
    if (pendingUpdate === true) {
      return;
    }
    pendingUpdate = true;

    document
      .querySelectorAll("[data-el='heading-3-→-how-many-diffusers-do-i-need']")
      .forEach((el) => {
        el.removeEventListener("click", onHeading3HowManyDiffusersDoINeedClick);
        el.addEventListener("click", onHeading3HowManyDiffusersDoINeedClick);
      });

    document.querySelectorAll("[data-el='div-1']").forEach((el) => {
      el.removeEventListener("click", onDiv1Click);
      el.addEventListener("click", onDiv1Click);
    });

    document.querySelectorAll("[data-el='img-1']").forEach((el) => {
      Object.assign(el.style, {
        transform: state.isLampSafeOpen ? "rotate(90deg)" : "rotate(0deg)",
      });
    });

    document.querySelectorAll("[data-el='show']").forEach((el) => {
      const whenCondition = state.isLampSafeOpen;
      if (whenCondition) {
        showContent(el);
      }
    });

    destroyAnyNodes();
    pendingUpdate = false;
  }

  // Event handler for 'click' event on heading-3-→-how-many-diffusers-do-i-need
  function onHeading3HowManyDiffusersDoINeedClick(event) {
    state.toggleFaq("isScamOpen");
  }

  // Event handler for 'click' event on div-1
  function onDiv1Click(event) {
    state.toggleFaq("isLampSafeOpen");
  }

  // Update with initial state on first load
  update();

  function showContent(el) {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement/content
    // grabs the content of a node that is between <template> tags
    // iterates through child nodes to register all content including text elements
    // attaches the content after the template
    const elementFragment = el.content.cloneNode(true);
    const children = Array.from(elementFragment.childNodes);
    children.forEach((child) => {
      if (el?.scope) {
        child.scope = el.scope;
      }
      if (el?.context) {
        child.context = el.context;
      }
      nodesToDestroy.push(child);
    });
    el.after(elementFragment);
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Get all FAQ items
    const faqItems = document.querySelectorAll('.flex.gap-4, .flex.gap-5');

    faqItems.forEach(item => {
      // Only add click handler if it's a FAQ item (has a heading and plus/minus icon)
      const heading = item.querySelector('h3');
      const icon = item.querySelector('img[alt*="Plus"], img[alt*="Minus"]');
      
      if (heading && icon) {
        // Create content wrapper if it doesn't exist
        let content = item.nextElementSibling;
        if (!content || !content.tagName || content.tagName !== 'DIV') {
          content = document.createElement('div');
          content.className = 'mt-3 text-base hidden';
          item.parentNode.insertBefore(content, item.nextSibling);
        }

        // Add click handler
        item.addEventListener('click', () => {
          // Toggle content visibility
          content.classList.toggle('hidden');
          
          // Toggle icon
          if (content.classList.contains('hidden')) {
            icon.setAttribute('alt', 'Plus Icon');
            icon.setAttribute('src', 'https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d');
          } else {
            icon.setAttribute('alt', 'Minus Icon');
            icon.setAttribute('src', 'https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/3c557652e0a341c6f1d78e6229899d40348e8efd');
          }
        });
      }
    });
  });
})();
