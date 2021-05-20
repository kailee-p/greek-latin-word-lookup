let leftCoord;
let topCoord;
const body = document.querySelector('body');

//detects where you clicked on the page and displays the popup modal near your cursor
document.addEventListener("contextmenu", (e) => {
  //make sure modal does not go off the page on left or right side
  leftCoord = Math.floor(e.pageX) - 50 >= 10 ? Math.floor(e.pageX) - 50 : 10;
  if (leftCoord + 250 > window.innerWidth) {
    leftCoord = window.innerWidth - 260;
  }
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

    getPage().then(data => { 
      
      //resourceSite holds all webpage HTML
      const resourceSite = document.createElement('div')
      resourceSite.innerHTML = data
      
      //pull mainCol div from Perseus Project
      const mainCol = resourceSite.querySelector('#main_col');
      const pTag = mainCol.querySelector('p');
      
      //initialize table variable - will be reassigned if multiple definitions
      let table;
      //initialize lemmaHeader variable - will be reassigned if multi defs
      let lemmaHeader;

      //error checking
      if (pTag.innerHTML.charAt(0) === "S") {
        defDiv.innerHTML = "<p>No definition of this word was found.</p>"
        body.appendChild(defDiv)
      } else {      
        //check if there were multiple definitions possible
        if (mainCol.querySelectorAll('.analysis').length > 1) {

          //paragraph to indicate multiple definitions
          const multiDefPara = document.createElement('p');
          multiDefPara.innerHTML = `<em>There were multiple definitions 
          returned for this word.</em>`;

          //dropdown menu
          const multiDefDropdown = document.createElement('select');
          //style dropdown
          multiDefDropdown.setAttribute('style', 'width: 230px;'
            + 'overflow: hidden;'
            + 'white-space: pre;'
            + 'text-overflow: ellipsis;');     

          //store definitions in an array
          const defArr = [];
          //push all definitions to array stored as object
          mainCol
            .querySelectorAll('.lemma')
            .forEach(lemma => {
              defArr.push({
                definition: lemma.querySelector('.lemma_definition').innerText.trim(),
                lemmaHeader: lemma.querySelector('.lemma_header'),
                table: lemma.querySelector('table')
              });
            })
          //iterate through definitions to create dropdown menu
          defArr.forEach((elem, idx) => {
              multiDefDropdown.innerHTML += `<option value=${idx}>${elem.definition}</option>`;
            })

          console.log(defArr[1].table);

          //append dropdown to modal        
          defDiv.appendChild(multiDefPara);
          defDiv.appendChild(multiDefDropdown);

          //append text & first definition found to table 
          pTag.innerHTML = `<a id="showGrammaticalTable" href="">Show more</a> <hr> <a href=${url} target="_blank">Go to Perseus Digital Library search results</a>`

          lemmaHeader = defArr[0].lemmaHeader;
          table = defArr[0].table;
          table.style.display = 'none'

          defDiv.appendChild(lemmaHeader);
          defDiv.appendChild(pTag);
          defDiv.appendChild(table);

          //toggle different definitions depending on selection
          multiDefDropdown.addEventListener('input', function(event) {
            //initialize currentSelection variable
            let currentSelection = event.target.value;

            //delete current divs/tables/text
            lemmaHeader.remove();
            pTag.remove();
            table.remove();

            //find new definition and table based on selection
            lemmaHeader = defArr[currentSelection].lemmaHeader;
            table = defArr[currentSelection].table;

            //append definition divs/tables/text to modal
            pTag.innerHTML = `<a id="showGrammaticalTable" href="">Show more</a> <hr> <a href=${url} target="_blank">Go to Perseus Digital Library search results</a>`

            table.style.display = 'none'
            defDiv.appendChild(lemmaHeader);
            defDiv.appendChild(pTag);
            defDiv.appendChild(table);

            //toggle the grammatical tables in the modal
            const toggle = pTag.querySelector("#showGrammaticalTable")
            toggle.addEventListener("click", (e) => {
              e.preventDefault();
              if (toggle.textContent === "Show more") {
                table.style.display = "block"
                toggle.textContent = 'Collapse'
              } else {
                table.style.display = "none"
                toggle.textContent = 'Show more'
              }
            });
          });

        } else { //only one definition found

          //fetch relevant divs from URL and put into modal
          lemmaHeader = mainCol.querySelector('.lemma_header');
          table = mainCol.querySelector('table');

          pTag.innerHTML = `<a id="showGrammaticalTable" href="">Show more</a> <hr> <a href=${url} target="_blank">Go to Perseus Digital Library search results</a>`
          
          table.style.display = 'none'
          defDiv.appendChild(lemmaHeader);
          defDiv.appendChild(pTag);
          defDiv.appendChild(table);
        }

        body.appendChild(defDiv)

        //toggle the grammatical tables in the modal
        const toggle = pTag.querySelector("#showGrammaticalTable")
        toggle.addEventListener("click", (e) => {
          e.preventDefault();
          if (toggle.textContent === "Show more") {
            table.style.display = "block"
            toggle.textContent = 'Collapse'
          } else {
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
