function sendToTab(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, data);
  });
}

function saveSettings(voiceIndex, voiceName, voiceLang, rate) {
  chrome.storage.local.set({ voiceIndex: voiceIndex, voiceName: voiceName, voiceLang: voiceLang, rate: rate });
}

function loadVoicesAndSettings() {
  const voiceSelect = document.getElementById("voiceSelect");
  voiceSelect.innerHTML = "";

  function populate() {
    const voices = speechSynthesis.getVoices();
    voices.forEach((v, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });

    // After voices are populated, restore saved settings if any
    chrome.storage.local.get({ voiceIndex: 0, voiceName: null, voiceLang: null, rate: 1 }, (items) => {
      document.getElementById("rate").value = items.rate || 1;

      // Try to match by name+lang first (safer across machines)
      let chosenIndex = -1;
      if (items.voiceName && items.voiceLang) {
        for (let i = 0; i < voices.length; i++) {
          if (voices[i].name === items.voiceName && voices[i].lang === items.voiceLang) {
            chosenIndex = i;
            break;
          }
        }
      }

      // If not found by name, fall back to stored index
      if (chosenIndex === -1) {
        const idx = Math.min(items.voiceIndex || 0, Math.max(0, voiceSelect.options.length - 1));
        chosenIndex = idx;
      }

      if (voiceSelect.options.length > 0) {
        voiceSelect.value = chosenIndex;
      }
    });
  }

  populate();
  // Some browsers fire voiceschanged after voices load
  speechSynthesis.onvoiceschanged = () => {
    populate();
  };
}

document.addEventListener("DOMContentLoaded", () => {
  loadVoicesAndSettings();

  // Save whenever user changes voice or rate
  document.getElementById("voiceSelect").addEventListener("change", (e) => {
    const voiceIndex = parseInt(e.target.value);
    const voices = speechSynthesis.getVoices();
    const selVoice = voices[voiceIndex] || null;
    const voiceName = selVoice ? selVoice.name : null;
    const voiceLang = selVoice ? selVoice.lang : null;
    const rate = parseFloat(document.getElementById("rate").value);
    saveSettings(voiceIndex, voiceName, voiceLang, rate);
  });

  document.getElementById("rate").addEventListener("change", (e) => {
    const rate = parseFloat(e.target.value);
    const voiceIndex = parseInt(document.getElementById("voiceSelect").value);
    const voices = speechSynthesis.getVoices();
    const selVoice = voices[voiceIndex] || null;
    const voiceName = selVoice ? selVoice.name : null;
    const voiceLang = selVoice ? selVoice.lang : null;
    saveSettings(voiceIndex, voiceName, voiceLang, rate);
  });

  document.getElementById("playBtn").addEventListener("click", () => {
    // get highlighted text from active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => window.getSelection ? window.getSelection().toString() : ""
      }, (res) => {
        const text = (res && res[0] && res[0].result) || "";
        // send the saved voice/name/lang/rate to the content script
        chrome.storage.local.get({ voiceIndex: 0, voiceName: null, voiceLang: null, rate: 1 }, (items) => {
          sendToTab({
            action: "speak",
            text: text,
            voiceName: items.voiceName,
            voiceLang: items.voiceLang,
            voiceIndex: parseInt(items.voiceIndex || 0),
            rate: parseFloat(items.rate || 1)
          });
        });
      });
    });
  });

  document.getElementById("pauseBtn").addEventListener("click", () => {
    sendToTab({ action: "pause" });
  });

  document.getElementById("stopBtn").addEventListener("click", () => {
    sendToTab({ action: "stop" });
  });
});
