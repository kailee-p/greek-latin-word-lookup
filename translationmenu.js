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
      //initialize variable for language as latin
      let lang = 'latin';

      // if conditional to check for language of searched string
      if (info.selectionText.charCodeat(0) >= 880 && info.selectionText.charCodeAt(0) <= 1023) {
        lang = 'greek';
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

//stretch goals
//access only one part of the website for iFrame
//popup near cursor
//some styling
//style extension popup