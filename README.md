current:
install the userscript by opening: https://raw.githubusercontent.com/allanlaal/google-keep-tab-titles/refs/heads/main/google-keep-tab-titles.user.js

old:
# Google Keep Tab Titles

A simple Chrome extension that dynamically updates the Google Keep tab title to match the title of the currently open note. This makes it easier to find the specific note you're working on when you have multiple tabs open.

## Features

- **Dynamic Tab Titles**: Automatically changes the tab title to the title of the note you are currently viewing or editing in Google Keep.
- **Quick Access**: Click the extension icon to quickly open Google Keep in a new tab.

## Installation

To install this extension, you can load it as an unpacked extension in Google Chrome.

1.  **Download the code**:
    - Clone this repository to your local machine:
      `git clone https://github.com/AMAMazing/google-keep-tab-titles.git`
    - Or, download the ZIP file and extract it.

2.  **Load the extension in Chrome**:
    - Open Google Chrome and navigate to `chrome://extensions`.
    - Enable **Developer mode** by toggling the switch in the top-right corner.
    - Click on the **Load unpacked** button.
    - Select the directory where you cloned or extracted the extension files.

The extension should now be installed and active.

## How It Works

The extension uses a content script that runs on `https://keep.google.com/`.

- **`content.js`**: This script is injected into the Google Keep page. It identifies the main text box of the note currently in view to extract its title. It uses a `MutationObserver` to watch for DOM changes, ensuring that the title is updated in real-time as you navigate between notes or edit a title. A throttle function is used to optimize performance by limiting the frequency of title updates to once every 50ms. This ensures the title updates feel responsive without causing performance issues.
- **`background.js`**: This service worker listens for a click on the extension's action icon. When clicked, it opens `https://keep.google.com/` in a new tab.
- **`manifest.json`**: This file defines the extension's properties, permissions, and scripts. It requests `tabs` permission to interact with the tab and `host_permissions` for `https://keep.google.com/*` to run the content script.
