var deck = [];
var extraDeck = [];
const MAXIMUM_DECK_SIZE = 30;
const MAXIMUM_EXTRA_SIZE = 7;
const MAXIMUM_COPIES = 3;

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
                newCard.innerHTML = "X " + cardCollection[i];
                newCard.onclick = function(event){selectCard(event, cardsList[i].card_id);}
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

function selectCard(event, cardId){
    let card = event.target||event.srcElement;
    let id;

    if(validateCard(cardId)){
        // get id of table to move to
        if(cardsList[cardId-1].extra) {
            extraDeck.push(cardId);
            id = "extraDeckCardsTable";
        } else {
            deck.push(cardId);
            id = "deckCardsTable";
        }
        // store original table id and move card
        let originalTable = card.parentElement.parentElement.id;
        let copyCard = card.cloneNode();
        document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(copyCard);
        copyCard.onclick = function(event){deselectCard(event, cardId, card);};
        cardCollection[cardId-1] -= 1;
        updateCardCount(card, cardId);
    }

    console.log(deck);
}

function deselectCard(event, cardId, originalCard) {
    let card = event.target||event.srcElement;
    let id = "collectionCardsTable";
    let originalTable = card.parentElement.parentElement.id;
    
    card.remove();
    cardCollection[cardId-1] += 1;    
    updateCardCount(originalCard, cardId);

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


function validateCard(cardId) {
    if(cardsList[cardId-1].extra) {
        return extraDeck.length < MAXIMUM_EXTRA_SIZE && 
               extraDeck.filter(x => x === cardId).length < MAXIMUM_COPIES && 
               cardCollection[cardId-1] > 0;
    } else {
        return deck.length < MAXIMUM_DECK_SIZE && 
        deck.filter(x => x === cardId).length < MAXIMUM_COPIES && 
        cardCollection[cardId-1] > 0;
    }
}

function updateCardCount(card, cardId) {
    card.innerHTML = "X " + cardCollection[cardId-1];
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