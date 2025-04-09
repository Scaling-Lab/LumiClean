/**
 * Alia Event Tracker
 * 
 * This script properly handles all five Alia events and sends them to the dataLayer.
 * It uses the DOM custom event approach which is the correct pattern according to Alia documentation.
 * 
 * Events tracked:
 * - alia:popupView - When a popup is viewed
 * - alia:popupClose - When a popup is closed
 * - alia:signup - When a user submits a form with email/phone
 * - alia:pollAnswered - When a user answers a survey question
 * - alia:rewardClaimed - When a user claims a reward/discount
 */

(function() {
    console.log('[Alia Tracker] Initializing Alia event tracking');
    
    // Define all five Alia event types
    const aliaEvents = [
        'alia:popupView',
        'alia:popupClose', 
        'alia:signup', 
        'alia:pollAnswered', 
        'alia:rewardClaimed'
    ];
    
    // Handle potential conflicts with other Alia event listeners
    function disableConflictingListeners() {
        if (window.Alia && typeof window.Alia.addEventListener === 'function') {
            // Create a backup if needed, but log a warning about using wrong approach
            window.Alia._originalAddEventListener = window.Alia.addEventListener;
            window.Alia.addEventListener = function() {
                console.warn('[Alia Tracker] Using window.Alia.addEventListener is not recommended. Using document event listeners instead.');
                return window.Alia._originalAddEventListener.apply(window.Alia, arguments);
            };
            console.log('[Alia Tracker] Added warning for window.Alia.addEventListener usage');
        }
    }

    // Set up listeners for all five Alia events
    function setupAliaEventListeners() {
        aliaEvents.forEach(eventType => {
            document.addEventListener(eventType, function(e) {
                const eventName = eventType.replace('alia:', '');
                console.log(`[Alia Tracker] Event received: ${eventType}`, e.detail);
                
                try {
                    // Ensure dataLayer exists
                    window.dataLayer = window.dataLayer || [];
                    
                    // Push to dataLayer
                    window.dataLayer.push({
                        event: `alia_${eventName.toLowerCase()}`,
                        alia_event_data: e.detail,
                        alia_event_time: new Date().toISOString()
                    });
                    
                    console.log(`[Alia Tracker] Successfully pushed to dataLayer: alia_${eventName.toLowerCase()}`);
                } catch (error) {
                    console.error(`[Alia Tracker] Error pushing to dataLayer: ${error.message}`);
                }
            });
            console.log(`[Alia Tracker] Added listener for ${eventType}`);
        });
    }

    // Test dataLayer existence
    function verifyDataLayer() {
        if (typeof window.dataLayer === 'undefined') {
            console.warn('[Alia Tracker] dataLayer is not initialized. Creating it now.');
            window.dataLayer = [];
            return false;
        } else if (!Array.isArray(window.dataLayer)) {
            console.error('[Alia Tracker] dataLayer exists but is not an array! Type:', typeof window.dataLayer);
            return false;
        }
        return true;
    }

    // Initialize when the DOM is ready
    function init() {
        disableConflictingListeners();
        setupAliaEventListeners();
        
        // Push an initialization event to verify dataLayer works
        if (verifyDataLayer()) {
            window.dataLayer.push({
                event: 'alia_tracker_initialized',
                alia_version: '1.0.0',
                alia_event_time: new Date().toISOString()
            });
            console.log('[Alia Tracker] Successfully initialized and verified dataLayer');
        }
    }

    // Execute initialization based on document ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 