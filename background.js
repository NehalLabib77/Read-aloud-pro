chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readText",
    title: "Read Selected Text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readText" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedText) => {
        const utterance = new SpeechSynthesisUtterance(selectedText);
        speechSynthesis.cancel(); // stop previous
        speechSynthesis.speak(utterance);
      },
      args: [info.selectionText]
    });
  }
});
