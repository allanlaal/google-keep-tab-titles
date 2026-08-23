// ==UserScript==
// @name         Google Keep Dynamic Tab Title
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Updates document title to the current note title on URL/DOM changes in Google Keep
// @match        https://keep.google.com/*
// @grant        none
// @run-at       document-idle
// ==UserScript==

(function() {
    'use strict';

    function getNoteTitle() {
        // 1. First priority: Check inside an actively opened modal dialog
        const modal = document.querySelector('div[role="dialog"]');
        if (modal) {
            const modalTextboxes = Array.from(modal.querySelectorAll('div[role="textbox"]'))
                .filter(el => el.getBoundingClientRect().width > 0);

            if (modalTextboxes.length > 0) {
                // The first textbox inside the dialog is always the Title field
                const titleText = modalTextboxes[0].innerText.trim();
                const cleanTitle = titleText.split('\n')[0];
                if (cleanTitle.length > 0) {
                    return cleanTitle + " - Google Keep";
                }
            }
        }

        // 2. Fallback: Search visible main textboxes if opened inline
        const visibleTextBoxes = Array.from(document.querySelectorAll('div[role="textbox"]'))
            .filter(el => el.getBoundingClientRect().width > 0);

        if (visibleTextBoxes.length === 0) {
            return "Google Keep";
        }

        const maxWidth = Math.max(...visibleTextBoxes.map(el => el.getBoundingClientRect().width));
        const widestElements = visibleTextBoxes.filter(el => el.getBoundingClientRect().width === maxWidth);

        if (widestElements.length === 1) {
            const titleElement = widestElements[0];
            const title = titleElement.innerText.trim();
            const cleanTitle = title.split('\n')[0];
            return cleanTitle.length > 0 ? cleanTitle + " - Google Keep" : "Google Keep";
        }

        return "Google Keep";
    }

    function updateTitle() {
        const title = getNoteTitle();
        if (document.title !== title) {
            document.title = title;
        }
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    const throttledUpdateTitle = throttle(updateTitle, 100);

    // Watch DOM mutations
    const observer = new MutationObserver(throttledUpdateTitle);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Intercept History API (pushState/replaceState)
    const patchHistoryMethod = (type) => {
        const original = history[type];
        return function() {
            const result = original.apply(this, arguments);
            window.dispatchEvent(new Event('locationchange'));
            return result;
        };
    };

    history.pushState = patchHistoryMethod('pushState');
    history.replaceState = patchHistoryMethod('replaceState');

    // Handle hash updates and popstate events (direct note clicks rely heavily on hash changes)
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
    window.addEventListener('hashchange', throttledUpdateTitle);
    window.addEventListener('locationchange', () => {
        setTimeout(updateTitle, 50); // slight delay to wait for Keep DOM render
    });

    // Initial run
    updateTitle();
})();
