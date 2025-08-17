# Read Aloud Pro

Read Aloud Pro is a small Chrome extension that reads selected text aloud using the Web Speech API. It provides a popup with voice and speed controls and a context-menu item to read highlighted text.

## Features
- Read selected text from the popup or context menu.
- Choose voice and adjust playback rate.
- Play / Pause / Stop controls.

## Files
- [manifest.json](manifest.json)
- [popup.html](popup.html)
- [popup.js](popup.js) — main popup logic, includes [`sendToTab`](popup.js) and [`loadVoices`](popup.js)
- [content.js](content.js) — content script that performs speech synthesis (`utterance` in [content.js](content.js))
- [background.js](background.js) — creates the context menu
- [style.css](style.css)

## Installation (for testing)
1. Open Chrome and go to chrome://extensions/.
2. Enable "Developer mode".
3. Click "Load unpacked" and select this project folder (the folder containing [manifest.json](manifest.json)).

## Usage
- Highlight text on any page.
- Click the extension icon to open the popup ([popup.html](popup.html)), select a voice and speed, then press "Play".
- Use "Pause" or "Stop" from the popup to control playback.
- Or right-click a selection and choose "Read Selected Text" (provided by [background.js](background.js)).

## Development notes
- Voices are loaded via the Web Speech API in [`loadVoices`](popup.js). Voice choice and rate are sent to the content script using chrome.scripting in [popup.js](popup.js).
- The content script ([content.js](content.js)) creates a SpeechSynthesisUtterance instance (`utterance`) and controls playback.
- Manifest is MV3 and requires the `scripting` and `activeTab` permissions ([manifest.json](manifest.json)).

## Known limitations
- Voice availability depends on the browser and OS.
- Speech runs in the context of the page (content script) for popup-initiated playback.

## License
MIT
