# Read Aloud Pro

Read Aloud Pro is a small Chrome extension that reads selected text aloud using the Web Speech API. It provides a popup UI with voice and speed controls, a context-menu item, and a keyboard command to read highlighted text.

## Features
- Read selected text from the popup, context menu, or keyboard shortcut.
- Choose a voice and adjust playback speed.
- Play / Pause / Stop controls.
- Stores last selected voice and rate in Chrome storage.

## Files
- [manifest.json](manifest.json)
- [popup.html](popup.html)
- [style.css](style.css)
- [popup.js](popup.js) — popup logic: [`loadVoicesAndSettings`](popup.js), [`sendToTab`](popup.js)
- [content.js](content.js) — content script that performs speech synthesis: [`utterance`](content.js), [`speakWithSettings`](content.js)
- [background.js](background.js) — context menu and command handling: [`speakSelectionInTab`](background.js)

## Installation (for testing)
1. Open Chrome and go to chrome://extensions/.
2. Enable "Developer mode".
3. Click "Load unpacked" and select this project folder (the folder containing [manifest.json](manifest.json)).

## Usage
- Highlight text on any page.
- Click the extension icon to open the popup ([popup.html](popup.html)), choose a voice and speed, then press "Play".
  - The popup uses [`loadVoicesAndSettings`](popup.js) to populate voices and restore saved settings.
  - When Play is pressed the popup collects the selected text and calls [`sendToTab`](popup.js) to instruct the content script.
- Right-click a selection and choose "Read Selected Text" (created by [background.js](background.js)); this uses [`speakSelectionInTab`](background.js) to synthesize speech in the page context.
- Use the keyboard command (Ctrl/Cmd+Shift+Y) to read the current selection (configured in [manifest.json](manifest.json)).

## Development notes
- Voices are provided by the browser's Web Speech API. Voice availability and exact names depend on OS and browser.
- The content script ([content.js](content.js)) creates and reuses a SpeechSynthesisUtterance (`utterance`) and uses [`speakWithSettings`](content.js) to select the best matching voice (by name+lang or index) and apply the saved rate.
- Settings (voice index/name/lang and rate) are persisted using chrome.storage and restored by [`loadVoicesAndSettings`](popup.js).

## Troubleshooting
- If no voices appear in the popup, try reloading the popup or the page; browsers sometimes populate voices asynchronously (the code listens for `speechSynthesis.onvoiceschanged`).
- If speech doesn't start from the popup, ensure the page has focus and that content scripts are injected for the page (`content.js` is configured for `<all_urls>` in [manifest.json](manifest.json)).

## License
MIT
