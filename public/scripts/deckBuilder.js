const MAXIMUM_DECK_SIZE = 30;
const MAXIMUM_EXTRA_SIZE = 7;
const MAXIMUM_COPIES = 3;
const HAND_SIZE = 4;
const COLLECTION_TABLE = "collectionCardsTable";
const DECK_TABLE = "deckCardsTable";
const EXTRA_DECK_TABLE = "extraDeckCardsTable";
const TEST_HAND_TABLE = "testHandCardsTable";
var deck = [];
var extraDeck = [];
var sortType = 1; //1 = name, 2 == star, 3 = price(asc), 4 = price (dsc)

function deckBuilderPageSetUp(){
    console.log(deck);
    displayCards(document.getElementById("collectionCardsTable"), cardCollection);
    document.getElementById("searchBar").addEventListener("input", () => {searchCards()});
    console.log(deck);
}

function displayCards(container, cardCollection){
    try{
        // add cards to right table and setup onclick event
        for(let i = 0; i < cardCollection.length; i++){
            if(cardCollection[i] > 0) {
                let newCard = createCard(i);
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
        sortTable(container);
    }
    // if no cards
    catch(TypeError){
        
    }
}

function createCard(cardIndex) {
    let newCard = document.createElement("button");
    newCard.className = "card";
    newCard.style.backgroundImage = "url('/" + cardsList[cardIndex].image + "')";
    newCard.style.backgroundSize = "contain";

    let quantityLabel = document.createElement("p");
    quantityLabel.className = "quantity";
    quantityLabel.innerHTML = "X " + cardCollection[cardIndex];
    newCard.appendChild(quantityLabel);

    let valueLabel = document.createElement("p");
    valueLabel.className = "value";
    valueLabel.innerHTML = "$" + cardsList[cardIndex].value;
    newCard.appendChild(valueLabel);

    newCard.dataset.id = cardsList[cardIndex].card_id;
    newCard.dataset.name = cardsList[cardIndex].name;
    newCard.dataset.stars = cardsList[cardIndex].stars;
    newCard.dataset.value = cardsList[cardIndex].value;
    newCard.onclick = function(event){selectCard(newCard, event, cardsList[cardIndex].card_id);}
    return newCard;
}

function selectCard(card, event, cardId){
    console.log("Click");
    let id;

    if(validateCard(cardId)){
        // get id of table to move to
        if(cardsList[cardId-1].extra) {
            extraDeck.push(cardId);
            id = EXTRA_DECK_TABLE;
        } else {
            deck.push(cardId);
            id = DECK_TABLE;
        }
        // store original table id and move card
        let originalTable = card.parentElement.parentElement.id;
        let copyCard = card.cloneNode();
        document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(copyCard);
        let valueLabel = document.createElement("p");
        valueLabel.className = "value";
        valueLabel.innerHTML = "$" + cardsList[cardId-1].value;
        copyCard.appendChild(valueLabel);
        copyCard.onclick = function(event){deselectCard(copyCard, event, cardId, card);};
        cardCollection[cardId-1] -= 1;
        updateCardCount(card, cardId);
        sortTable(document.getElementById(id));
        if(!validateCard(cardId)) {
            grayscaleCard(card);
        }
        hideTestHand()
    }
}

function deselectCard(card, event, cardId, originalCard) {
    let id = COLLECTION_TABLE;
    let originalTable = card.parentElement.parentElement.id;
    
    card.remove();
    cardCollection[cardId-1] += 1;    
    updateCardCount(originalCard, cardId);

    if(cardsList[cardId-1].extra) {
        var cardIndex = extraDeck.indexOf(cardId);
        if(cardIndex >= 0) {
            extraDeck.splice(cardIndex, 1);
        }
    } else {
        var cardIndex = deck.indexOf(cardId);
        if(cardIndex >= 0) {
            deck.splice(cardIndex, 1);
        }
    }

    if(validateCard(cardId)) {
        unGrayscaleCard(originalCard);
    }
    hideTestHand()
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

function grayscaleCard(card) {
    card.style.filter = "gray";
    card.style.webkitFilter = "grayscale(1)";
    card.style.filter = "grayscale(1)";
}

function unGrayscaleCard(card) {
    card.style.webkitFilter = "grayscale(0)";
    card.style.filter = "none";
}

function updateCardCount(card, cardId) {
    quantityLabel = card.getElementsByClassName("quantity")[0];
    quantityLabel.innerHTML = "X " + cardCollection[cardId-1];
}

function changeSortType(type) {
    sortType = type;
    sortTable(document.getElementById(COLLECTION_TABLE));
    sortTable(document.getElementById(DECK_TABLE));
    sortTable(document.getElementById(EXTRA_DECK_TABLE));
}

function sortTable(container) {
    var cards = [].slice.call(container.getElementsByClassName("card"));
    console.log(sortType);
    
    sortCards(cards);

    for(let card of cards) {
        card.parentElement.appendChild(card);
    }
}

function sortCards(cards) {
    switch (sortType) {
        case 1:
           cards.sort((a,b) => {
               let nameA = a.dataset.name.toLowerCase();
               let nameB = b.dataset.name.toLowerCase();
               if(nameA > nameB) return 1;
               if(nameA < nameB) return -1;
               return 0;
           });
           break;
        case 2:
            cards.sort((a,b) => {
                let starsA = a.dataset.stars;
                let starsB = b.dataset.stars;
                if(starsA > starsB) return 1;
                if(starsA < starsB) return -1;
                let nameA = a.dataset.name.toLowerCase();
                let nameB = b.dataset.name.toLowerCase();
                if(nameA > nameB) return 1;
                if(nameA < nameB) return -1;
                return 0;
            });
            break;
        case 3:
            cards.sort((a,b) => {
                let valueA = a.dataset.value;
                let valueB = b.dataset.value;
                if(valueA > valueB) return 1;
                if(valueA < valueB) return -1;
                return 0;
            });
            break;
        case 4:
            cards.sort((a,b) => {
                let valueA = a.dataset.value;
                let valueB = b.dataset.value;
                if(valueA > valueB) return -1;
                if(valueA < valueB) return 1;
                return 0;
            });
            break;
    }
}

function searchCards() {
    let searchString = document.getElementById("searchBar").value;
    if(searchString == "") {
        sortTable(document.getElementById(COLLECTION_TABLE));
        sortTable(document.getElementById(DECK_TABLE));
        sortTable(document.getElementById(EXTRA_DECK_TABLE));
    } else {
        let cards = [].slice.call(document.getElementsByClassName("card"));
        let foundCards = [];
        for(let card of cards) {
            let cardName = card.dataset.name.toLowerCase();
            if(cardName.includes(searchString.toLowerCase())) {
                console.log(cardName);
                foundCards.push(card);
            }
        }
        sortCards(foundCards);
        for(var i = foundCards.length - 1; i >= 0; i--) {
            let card = foundCards[i];
            card.parentElement.insertBefore(card, card.parentElement.firstChild);
        }
    }
}

function drawTestHand() {
    let table = document.getElementById(TEST_HAND_TABLE);
    table.parentElement.hidden = false;
    while(table.firstChild) {
        table.removeChild(table.lastChild);
    }

    if(deck.length >= HAND_SIZE) {
        let workingDeck = deck.slice();
        let hand = [];
        for(var i = 0; i < HAND_SIZE; i++) {
            let drawnCard = randomCard(workingDeck.length);
            hand.push(workingDeck[drawnCard]);
            workingDeck.splice(drawnCard, 1);
        }

        for(let card of hand) {
            let cardImage = document.createElement("img");
            cardImage.src = "/" + cardsList[card-1].image;
            cardImage.className = "cardImage";
            table.appendChild(cardImage);
        }
    }
}

function randomCard(cardCount) {
    return Math.floor(Math.random() * cardCount);
}

function hideTestHand() {
    document.getElementById(TEST_HAND_TABLE).parentElement.hidden = true;
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