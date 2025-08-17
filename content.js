let utterance;

function speakWithSettings(text, voiceName, voiceLang, voiceIndex, rate) {
  speechSynthesis.cancel();
  utterance = new SpeechSynthesisUtterance(text || "");

  function pickAndSpeak() {
    const voices = speechSynthesis.getVoices();
    let chosen = null;
    if (voiceName && voiceLang) {
      for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === voiceName && voices[i].lang === voiceLang) {
          chosen = voices[i];
          break;
        }
      }
    }
    if (!chosen && typeof voiceIndex === 'number' && voiceIndex >= 0 && voiceIndex < voices.length) {
      chosen = voices[voiceIndex];
    }
    if (chosen) utterance.voice = chosen;
    utterance.rate = rate || 1;
    speechSynthesis.speak(utterance);
  }

  // voices may not be loaded yet
  const voicesNow = speechSynthesis.getVoices();
  if (voicesNow && voicesNow.length > 0) {
    pickAndSpeak();
  } else {
    speechSynthesis.onvoiceschanged = () => {
      pickAndSpeak();
    };
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "speak") {
    speakWithSettings(msg.text || "", msg.voiceName || null, msg.voiceLang || null, typeof msg.voiceIndex === 'number' ? msg.voiceIndex : null, msg.rate || 1);
  } else if (msg.action === "pause") {
    speechSynthesis.pause();
  } else if (msg.action === "stop") {
    speechSynthesis.cancel();
  }
});
