function deckBuilderPageSetUp(){
    console.log(cardsList[227].name);
    const cardsInDeck = [];
    displayCards(document.getElementById("collectionCardsTable"), cardCollection);
}

function displayCards(container, cardCollection){
    try{
        
        // add cards to right table and setup onclick event
        for(let i = 0; i < cardCollection.length; i++){
            if(cardCollection[i] > 1) {
                let newCard = document.createElement("button");
                newCard.className = "card";
                newCard.innerHTML = cardsList[i].card_id;
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
        id = "deckCardsTable";
        // store original table id and move card
        let originalTable = card.parentElement.parentElement.id;
        if(cardCollection[card.innerHTML-1] > 1) {
            let copyCard = card.cloneNode();
            copyCard.innerHTML = card.innerHTML;
            document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(copyCard);
            copyCard.onclick = function(event){selectCard(event, !deselect);};
            cardCollection[card.innerHTML-1] -= 1;
        } else {
            document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(card);
            card.onclick = function(event){selectCard(event, !deselect);};
            cardCollection[card.innerHTML-1] -= 1;
        }
    } else {
        id = "collectionCardsTable";
        let originalTable = card.parentElement.parentElement.id;
        if(cardCollection[card.innerHTML-1] < 1) {
            //if the collection has no cards of this type left, move this element over and add 1
            document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(card);
            card.onclick = function(event){selectCard(event, !deselect);};
            cardCollection[card.innerHTML-1] += 1;
        } else {
            //otherwise, simply delete this element and add one to the count
            card.remove();
            cardCollection[card.innerHTML-1] += 1;
        }
    }


    // update no contents message
    // checkTableEmpty(originalTable);
    // checkTableEmpty(id);
}