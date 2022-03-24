function deckBuilderPageSetUp(){
    const cardsInDeck = [];
    displayCards(document.getElementById("collectionCardsTable"), cardCollection);
}

function displayCards(container, cardCollection){
    try{
        
        // add cards to right table and setup onclick event
        for(let i = 0; i < cardCollection.length; i++){
            if(cardCollection[i] > 0) {
                let newCard = document.createElement("button");
                newCard.className = "card";
                newCard.style.backgroundImage = "url('/" + cardsList[i].image + "')";
                newCard.style.backgroundSize = "contain";
                newCard.src = "/" + cardsList[i].image;
                newCard.onclick = function(event){selectCard(event, cardsList[i].card_id, false);}
                container.getElementsByTagName("tbody")[0].appendChild(newCard);
            }
        }
    }
    // if no cards
    catch(TypeError){
        
    }
}

function selectCard(event, cardId, deselect){
    let card = event.target||event.srcElement;
    let id;

    // get id of table to move to
    if(!deselect){
        id = "deckCardsTable";
        // store original table id and move card
        let originalTable = card.parentElement.parentElement.id;
        if(cardCollection[cardId-1] > 1) {
            console.log("Spare copies");
            let copyCard = card.cloneNode();
            document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(copyCard);
            copyCard.onclick = function(event){selectCard(event, cardId, !deselect);};
            cardCollection[cardId-1] -= 1;
        } else {
            document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(card);
            card.onclick = function(event){selectCard(event, cardId, !deselect);};
            cardCollection[cardId-1] = 0;
        }
    } else {
        id = "collectionCardsTable";
        let originalTable = card.parentElement.parentElement.id;
        if(cardCollection[cardId-1] < 1) {
            //if the collection has no cards of this type left, move this element over and add 1
            document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(card);
            card.onclick = function(event){selectCard(event, cardId, !deselect);};
            cardCollection[cardId-1] += 1;
        } else {
            //otherwise, simply delete this element and add one to the count
            card.remove();
            cardCollection[cardId-1] += 1;
        }
    }


    // update no contents message
    // checkTableEmpty(originalTable);
    // checkTableEmpty(id);
}