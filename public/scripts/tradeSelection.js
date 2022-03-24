// trade selection
function tradeSelectionPageSetUp(){
    displayCards(document.getElementById("initiatorCardsTable"), user1.cards);
    displayCards(document.getElementById("receiverCardsTable"), user2.cards);

    if(counter != -1){
        setUpTable(offered, wanted);
    }
}

// if counter trade, move cards to correct table
function setUpTable(offered, wanted){
    let cards = document.getElementById("initiatorCards").getElementsByTagName("img");
    for(let card of offered){
        let cardButton = findCardButton(card, cards);
        cardButton.click();
    }
    
    cards = document.getElementById("receiverCards").getElementsByTagName("img");
    for(let card of wanted){
        let cardButton = findCardButton(card, cards);
        cardButton.click();
    }
}

// get card button from id
function findCardButton(id, container){
    for(let card of container){
        if(card.data == id){return card;}
    }
}

// display cards
function displayCards(container, cards){
    try{
        // add cards to right table and setup onclick event
        for(let card of cards){
            if(card == 0){continue;}
            let newCard = document.createElement("img");
            newCard.className = "card";
            newCard.data = card;
            newCard.src = "/" + (cardData.find(x=>x.card_id == card)).image;

            // set up click events
            if(container.id == "initiatorCardsTable"){
                newCard.onclick = function(event){selectCard(event, "OFFER", false, card);}
            }
            else{
                newCard.onclick = function(event){selectCard(event, "RECEIVE", false, card);}
            }
            container.getElementsByTagName("tbody")[0].appendChild(newCard);
        }
    }
    // if no cards
    catch(error){
        checkTableEmpty("initiatorCardsTable");
        checkTableEmpty("receiverCardsTable");
    }
}

// move card to proper table on select
function selectCard(event, type, deselect, cardId){
    let card = event.target||event.srcElement;
    let id;

    // get id of table to move to
    if(!deselect){
        if(type=="OFFER"){
            id = "offeredCardsTable";
        }
        else{
            id = "wantedCardsTable";
        }
    }
    else{
        if(type=="OFFER"){
            id = "initiatorCardsTable";
        }
        else{
            id = "receiverCardsTable";
        }
    }

    // store original table id and move card
    let originalTable = card.parentElement.parentElement.id;
    document.getElementById(id).getElementsByTagName("tbody")[0].appendChild(card);
    card.onclick = function(event){selectCard(event, type, !deselect);};

    // update no contents message
    checkTableEmpty(originalTable);
    checkTableEmpty(id);

    updateValue(type, deselect, card.data);
}

// display message if no items in table
function checkTableEmpty(id){
    let contents = document.getElementById(id).getElementsByTagName("img");
    document.getElementById(id).getElementsByClassName("noMatchMessage")[0].hidden = contents.length > 0;
}

// send new trade data to database
function tradeSendRequest(){
    let offeredCards = [];
    let requestedCards = [];

    // get card ids
    let offerTableCards = document.getElementById("offeredCardsTable").
                            getElementsByClassName("card");
    let requestTableCards = document.getElementById("wantedCardsTable").
                            getElementsByClassName("card");
    for(let card of offerTableCards){
        offeredCards.push(parseInt(card.data));
    }
    for(let card of requestTableCards){
        requestedCards.push(parseInt(card.data));
    }

    // make post request
    post("/newTradeRequest", {offer: offeredCards, request: requestedCards,
                            sender_id: user1.id, receiver_id: user2.id,
                            counter:counter});

    // if counter trade, delete original request
    if(counter != -1){
        post("/deleteTrade", {tradeId: counter});
    }

    // return to trade page
    alert("Trade request sent. Please check \'Ongoing Trades\' to see the status of your request");
    window.location = window.location.protocol + "//" +
                    window.location.host + "/trade";
}

// send post request to server
function post(endpoint, data){
    let xhr = new XMLHttpRequest();
    xhr.open("POST","/trade/"+ endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}

// display values
function updateValue(type, deselect, cardId){
    let changeAmount = (cardData.find(x=> x.card_id == cardId)).value;
    changeAmount *= deselect? -1:1;

    let priceObjs = document.getElementsByClassName("priceLabel");
    let priceObjIndx = type == "OFFER"? 0:2;

    let newValue = parseFloat(priceObjs[priceObjIndx].innerHTML.replace('$','')) + changeAmount;
    priceObjs[priceObjIndx].innerHTML = '$' + newValue.toFixed(2);
}