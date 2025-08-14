function sendToTab(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, data);
  });
}

function loadVoices() {
  const voiceSelect = document.getElementById("voiceSelect");
  voiceSelect.innerHTML = "";
  const voices = speechSynthesis.getVoices();
  voices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

document.getElementById("playBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => window.getSelection().toString()
    }).then((selection) => {
      const text = selection[0].result;
      if (!text) {
        alert("Please select some text first.");
        return;
      }
      sendToTab({
        action: "speak",
        text: text,
        voiceIndex: parseInt(document.getElementById("voiceSelect").value),
        rate: parseFloat(document.getElementById("rate").value)
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
