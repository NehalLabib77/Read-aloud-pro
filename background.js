chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readText",
    title: "Read Selected Text",
    contexts: ["selection"]
  });
});

function speakSelectionInTab(tabId, selectionText, voiceName, voiceLang, voiceIndex, rate) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    args: [selectionText, voiceName, voiceLang, voiceIndex, rate],
    func: (selectedText, voiceNameArg, voiceLangArg, voiceIndexArg, rateArg) => {
      const text = selectedText || "";
      if (!text) return;
      const utter = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      let chosen = null;
      if (voiceNameArg && voiceLangArg) {
        for (let i = 0; i < voices.length; i++) {
          if (voices[i].name === voiceNameArg && voices[i].lang === voiceLangArg) {
            chosen = voices[i];
            break;
          }
        }
      }
      if (!chosen && typeof voiceIndexArg === 'number' && voiceIndexArg >= 0 && voiceIndexArg < voices.length) {
        chosen = voices[voiceIndexArg];
      }
      if (chosen) utter.voice = chosen;
      utter.rate = rateArg || 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readText" && info.selectionText) {
    chrome.storage.local.get({ voiceIndex: 0, voiceName: null, voiceLang: null, rate: 1 }, (items) => {
      const voiceIndex = parseInt(items.voiceIndex || 0);
      const voiceName = items.voiceName || null;
      const voiceLang = items.voiceLang || null;
      const rate = parseFloat(items.rate || 1);
      speakSelectionInTab(tab.id, info.selectionText, voiceName, voiceLang, voiceIndex, rate);
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "read-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      const tab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection ? window.getSelection().toString() : ""
      }, (res) => {
        const text = (res && res[0] && res[0].result) || "";
        if (!text) return;
        chrome.storage.local.get({ voiceIndex: 0, voiceName: null, voiceLang: null, rate: 1 }, (items) => {
          const voiceIndex = parseInt(items.voiceIndex || 0);
          const voiceName = items.voiceName || null;
          const voiceLang = items.voiceLang || null;
          const rate = parseFloat(items.rate || 1);
          speakSelectionInTab(tab.id, text, voiceName, voiceLang, voiceIndex, rate);
        });
      });
    });
  }
});
