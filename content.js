let leftCoord;
let topCoord;
const body = document.querySelector('body')

//detects where you clicked on the page and displays the popup modal near your cursor
document.addEventListener("contextmenu", (e)=>{
  leftCoord = Math.floor(e.pageX) - 50 >= 10 ? Math.floor(e.pageX) - 50 : 10;
  topCoord = Math.floor(e.pageY) + 15;
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
  if(message.txt === 'run'){

    let lang = 'greek';

    // if conditional to check for language of searched string
    if (message.word.charCodeAt(0) >= 65 && message.word.charCodeAt(0) <= 339) {
      lang = 'latin';
    }
    
    //url of dictionary search
    const url = `https://www.perseus.tufts.edu/hopper/morph?l=${message.word}&la=${lang}`
    const getPage = async () =>{
      const response = await fetch(url);
      const data = await response.text()
      return data;
    }

    //styling for modal
    const defDiv = document.createElement('div');
      defDiv.setAttribute("style", "background-color: white;"
        + "color: black;" 
        + 'width: 250px; '
        + 'position: absolute; '
        + `top: ${topCoord}px;`
        + `left: ${leftCoord}px;`
        + 'border: 2px solid lightgrey;'
        + 'padding: 0px 10px;'
        + `font-family:'Helvetica', Arial, sans-serif;`
        + 'z-index: 9999; ');

    getPage().then(data=>{
      
      //resourceSite holds all webpage HTML
      const resourceSite = document.createElement('div')
      resourceSite.innerHTML = data
      
      //pull mainCol div from Perseus Project
      const mainCol = resourceSite.querySelector('#main_col');
      const pTag = mainCol.querySelector('p');

      //error checking
      if (pTag.innerHTML.charAt(0) === "S") {
        defDiv.innerHTML = "<p>No definition of this word was found.</p>"
        body.appendChild(defDiv)
      } else {          
        
        //fetch relevant divs from URL and put into modal
        const lemmaHeader = mainCol.querySelector('.lemma_header');
        const table = mainCol.querySelector('table');

        pTag.innerHTML = `<a id="showGrammaticalTable" href="">Show more</a> <hr> <a href=${url} target="_blank">Go to full lexicon entry (Perseus Project)</a>`
        
        table.style.display = 'none'

        defDiv.appendChild(lemmaHeader);
        defDiv.appendChild(pTag);
        defDiv.appendChild(table);

        //check if there were multiple definitions possible
        if (mainCol.querySelectorAll('.lemma_header').length > 1) {
          const multiDefPara = document.createElement('p');
          multiDefPara.innerHTML = '<em>There were multiple definitions returned for this word. Check Perseus Project for all possible definitions.</em>';
          defDiv.appendChild(multiDefPara);
        }

        body.appendChild(defDiv)

        //toggle the grammatical tables in the modal
        const toggle = body.querySelector("#showGrammaticalTable")
        toggle.addEventListener("click", (e)=>{
          e.preventDefault()
          if(toggle.textContent === "Show more"){
            table.style.display = "block"
            toggle.textContent = 'Collapse'
          }else{
            table.style.display = "none"
            toggle.textContent = 'Show more'
          }
        })
      }

      //clicking outside div removes div
      window.addEventListener("click", (e) => {
        if (!defDiv.contains(e.target)) {          
          defDiv.remove();
        }
      });
    })
  }
})
