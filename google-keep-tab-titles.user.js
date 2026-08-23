// ==UserScript==
// @name         Google Keep Dynamic Tab Title
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Updates document title to the current note title on URL/DOM changes in Google Keep
// @match        https://keep.google.com/*
// @grant        none
// @run-at       document-idle
// ==UserScript==

(function() {
    'use strict';

    function getNoteTitle() {
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
            return title.split('\n')[0] || "Google Keep";
        } else {
            return "Google Keep";
        }
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

    const throttledUpdateTitle = throttle(updateTitle, 50);

    // Watch DOM changes (covers note edits and open/close overlays)
    const observer = new MutationObserver(throttledUpdateTitle);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Intercept History API methods to trigger updates on SPA URL navigation
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

    window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
    window.addEventListener('locationchange', throttledUpdateTitle);

    // Initial run
    updateTitle();
})();
