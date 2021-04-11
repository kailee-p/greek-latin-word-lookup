//context menu that displays upon right clicking a selected word
const translationContextMenu = {
  "id": "Translation Context Menu",
  "title": "Translate Greek/Latin Word",
  "contexts": ["all"] 
};
chrome.contextMenus.create(translationContextMenu); 

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  let msg = {
    txt: "run",
    word: info.selectionText
  }
  chrome.tabs.sendMessage(tab.id, msg)
})