var deck = [];
var extraDeck = [];

function deckBuilderPageSetUp(){
    
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
                if(cardsList[i].extra) {
                    for(var j = 0; j < savedExtra.length; j++) {
                        if(cardsList[i].card_id == savedExtra[j]) {
                            newCard.click();
                        }
                    }
                } else {
                    for(var j = 0; j < savedDeck.length; j++) {
                        if(cardsList[i].card_id == savedDeck[j]) {
                            newCard.click();
                        }
                    }
                }
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
        //deck build limits go here
        if(cardsList[cardId-1].extra) {
            extraDeck.push(cardId);
            id = "extraDeckCardsTable";
        } else {
            deck.push(cardId);
            id = "deckCardsTable";
        }
        // store original table id and move card
        let originalTable = card.parentElement.parentElement.id;
        if(cardCollection[cardId-1] > 1) {
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
        if(cardsList[cardId-1].extra) {
            var cardIndex = extraDeck.indexOf(cardId);
            if(cardIndex > 1) {
                extraDeck.splice(cardIndex, 1);
            }
        } else {
            var cardIndex = deck.indexOf(cardId);
            if(cardIndex > 1) {
                deck.splice(cardIndex, 1);
            }
        }
    }


    // update no contents message
    // checkTableEmpty(originalTable);
    // checkTableEmpty(id);
}

function saveDeck() {
    var deckName = document.getElementById("deckName").value;

    if(deckName.length > 0) {
        post('/save', { name: deckName, cards: deck, extra: extraDeck });
    
        alert("Deck Saved");
        window.location = window.location.protocol + "//" +
                        window.location.host + "/deckBuild/decks";
    } else {
        alert("Please give your deck a name");
    }
}

function post(endpoint, data){
    let xhr = new XMLHttpRequest();
    xhr.open("POST","/deckBuild"+ endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}