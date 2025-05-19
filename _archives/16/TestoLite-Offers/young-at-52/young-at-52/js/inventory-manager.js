/**
 * Inventory Manager Module
 * A reusable module for managing dynamic inventory display on product pages
 */

class InventoryManager {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            storagePrefix: 'testolite_',
            initialInventory: 83, // Default starting inventory
            sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            inventorySelectors: ['.inventory-count', '#inventory-count'], // Selectors for inventory display elements
            enableRandomReduction: true, // Whether to enable random inventory reduction
            minReductionDelay: 1 * 60 * 1000, // Minimum delay between reductions (1 minute)
            maxReductionDelay: 5 * 60 * 1000, // Maximum delay between reductions (5 minutes)
            debug: false, // Enable debug logs
            ...options // Override defaults with provided options
        };

        // Storage keys
        this.STORAGE_KEYS = {
            INVENTORY: `${this.config.storagePrefix}inventory`,
            SESSION_START: `${this.config.storagePrefix}session_start`
        };

        // Current state
        this.inventory = 0;
        this.reductionTimeout = null;

        // Bind methods
        this.updateDisplays = this.updateDisplays.bind(this);
        this.scheduleNextReduction = this.scheduleNextReduction.bind(this);
        this.reduceInventory = this.reduceInventory.bind(this);
        this.log = this.log.bind(this);
    }

    /**
     * Initialize the inventory manager
     * @returns {InventoryManager} The instance for chaining
     */
    init() {
        this.log('Initializing inventory manager');
        this.inventory = this.initializeInventory();
        this.updateDisplays();
        
        if (this.config.enableRandomReduction) {
            this.scheduleNextReduction();
        }
        
        return this;
    }

    /**
     * Initialize or get inventory from storage
     * @returns {number} The current inventory count
     */
    initializeInventory() {
        let inventory = localStorage.getItem(this.STORAGE_KEYS.INVENTORY);
        let sessionStart = localStorage.getItem(this.STORAGE_KEYS.SESSION_START);
        
        this.log(`Read from localStorage: inventory=${inventory}, sessionStart=${sessionStart}`);

        if (!inventory || !sessionStart) {
            // Start new session
            inventory = this.config.initialInventory;
            sessionStart = new Date().getTime();
            
            this.log(`No stored data. Initializing: inventory=${inventory}, sessionStart=${sessionStart}`);
            
            localStorage.setItem(this.STORAGE_KEYS.INVENTORY, inventory);
            localStorage.setItem(this.STORAGE_KEYS.SESSION_START, sessionStart);
        } else {
            inventory = parseInt(inventory);
            sessionStart = parseInt(sessionStart);
            
            // Check if session duration has passed
            if (new Date().getTime() - sessionStart > this.config.sessionDuration) {
                this.log(`Session expired (>${this.config.sessionDuration/3600000}h). Resetting.`);
                
                // Reset session
                inventory = this.config.initialInventory;
                sessionStart = new Date().getTime();
                
                localStorage.setItem(this.STORAGE_KEYS.INVENTORY, inventory);
                localStorage.setItem(this.STORAGE_KEYS.SESSION_START, sessionStart);
            } else {
                this.log(`Using stored inventory: ${inventory}`);
            }
        }
        
        return inventory;
    }

    /**
     * Update all inventory displays in the DOM
     */
    updateDisplays() {
        this.log(`Updating displays to show inventory: ${this.inventory}`);
        
        // Try each selector and update elements if found
        this.config.inventorySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(el => {
                    el.textContent = this.inventory;
                });
                this.log(`Updated ${elements.length} elements with selector "${selector}"`);
            }
        });
        
        // Save current inventory to localStorage
        localStorage.setItem(this.STORAGE_KEYS.INVENTORY, this.inventory);
    }

    /**
     * Schedule the next random inventory reduction
     */
    scheduleNextReduction() {
        if (this.reductionTimeout) {
            clearTimeout(this.reductionTimeout);
        }
        
        // Calculate random delay between min and max
        const delay = Math.floor(
            Math.random() * 
            (this.config.maxReductionDelay - this.config.minReductionDelay) + 
            this.config.minReductionDelay
        );
        
        this.log(`Scheduling next reduction in ${delay/1000} seconds`);
        
        this.reductionTimeout = setTimeout(this.reduceInventory, delay);
    }

    /**
     * Reduce the inventory by one unit and update displays
     */
    reduceInventory() {
        if (this.inventory > 1) { // Prevent going to zero
            this.inventory--;
            this.log(`Reducing inventory to ${this.inventory}`);
            this.updateDisplays();
            this.scheduleNextReduction();
        } else {
            this.log('Inventory minimum reached, no further reductions');
        }
    }

    /**
     * Manually set the inventory to a specific value
     * @param {number} count - The new inventory count
     */
    setInventory(count) {
        this.log(`Manually setting inventory to ${count}`);
        this.inventory = count;
        this.updateDisplays();
        return this;
    }

    /**
     * Log message if debug is enabled
     * @param {string} message - The message to log
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[InventoryManager] ${message}`);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.reductionTimeout) {
            clearTimeout(this.reductionTimeout);
            this.reductionTimeout = null;
        }
        this.log('Inventory manager destroyed');
    }
}

// Export the InventoryManager class
window.InventoryManager = InventoryManager; 