let utterance;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "speak") {
    speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(msg.text);
    utterance.voice = speechSynthesis.getVoices()[msg.voiceIndex];
    utterance.rate = msg.rate;
    speechSynthesis.speak(utterance);
  } else if (msg.action === "pause") {
    speechSynthesis.pause();
  } else if (msg.action === "stop") {
    speechSynthesis.cancel();
  }
});
