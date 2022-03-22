function deckBuilderPageSetUp(){
    console.log(cardsList[227].name);
    displayCards(document.getElementById("collectionCardsTable"), cardCollection);
}

function displayCards(container, cardCollection){
    try{
        
        // add cards to right table and setup onclick event
        for(let i = 0; i < cardCollection.length; i++){
            if(cardCollection[i] > 1) {
                let newCard = document.createElement("button");
                newCard.className = "card";
                newCard.innerHTML = cardsList[i].name;
                newCard.onclick = function(event){selectCard(event, false);}
                container.getElementsByTagName("tbody")[0].appendChild(newCard);
            }
        }
    }
    // if no cards
    catch(TypeError){
        
    }
}

function selectCard(event, deselect){
    let card = event.target||event.srcElement;
    let id;

    // get id of table to move to
    if(!deselect){
        id = "collectionCardsTable";
    } else {
        id = "deckCardsTable";
    }

    // store original table id and move card
    let originalTable = card.parentElement.parentElement.id;
    document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(card);
    card.onclick = function(event){selectCard(event, !deselect);};

    // update no contents message
    checkTableEmpty(originalTable);
    checkTableEmpty(id);
}