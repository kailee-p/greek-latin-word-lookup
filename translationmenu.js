const translationContextMenu = {
  "id": "Translation Context Menu",
  "title": "Translate Greek/Latin Word",
  "contexts": ["all"] 
};
chrome.contextMenus.create(translationContextMenu); 

//translation function
function translate() {
  alert('Translate');
  //inject code into current tab
  chrome.tabs.executeScript(tab.id, () => {
    console.log('test')
  });
}

//call translation function when menu is clicked
// chrome.contextMenus.onClicked.addListener(translate);

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (tab) {
      // if conditional to check if string has Latin or Greek characters
      if (info.selectionText.charCodeAt(0) >= 97 && info.selectionText.charCodeAt(0) <= 687) {
        info.selectionText += '&la=la' //search URL defaults to Greek search unless Latin is passed in
      }

      //code to be injected
      var code = [
          'var d = document.createElement("div");',
          'd.setAttribute("style", "'
              + 'background-color: white; '
              + 'color: black; '
              + 'width: 100px; '
              + 'height: 100px; '
              + 'position: fixed; '
              + 'top: 70px; '
              + 'left: 30px; '
              + 'z-index: 9999; '
              + '");',
              'let iframe = document.createElement("iframe")',
              `iframe.setAttribute("src", "https://www.perseus.tufts.edu/hopper/morph?l=${info.selectionText}#lexicon")`,
              'd.appendChild(iframe)',
              'document.body.appendChild(d);',
          `console.log('${info.selectionText}')`
      ].join("\n");
      // info.selectionText
      
      /* Inject the code into the current tab */
      chrome.tabs.executeScript(tab.id, { code: code });
  }
});

//functionality issues
//need to distinguish between Latin/Greek
//need to be able to select a new word and search

//stretch goals
//access only one part of the website for iFrame
//popup near cursor
//some styling
//style extension popup
//manifest 3