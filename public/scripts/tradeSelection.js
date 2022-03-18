// trade selection
function tradeSelectionPageSetUp(){
    displayCards(document.getElementById("initiatorCardsTable"), user1.cards);
    displayCards(document.getElementById("receiverCardsTable"), user2.cards);
}

// display cards
function displayCards(container, cards){
    try{
        // add cards to right table and setup onclick event
        for(let card of cards){
            let newCard = document.createElement("button");
            newCard.className = "card";
            newCard.innerHTML = card;
            if(container.id == "initiatorCardsTable"){
                newCard.onclick = function(event){selectCard(event, "OFFER", false);}
            }
            else{
                newCard.onclick = function(event){selectCard(event, "RECEIVE", false);}
            }
            container.getElementsByTagName("tbody")[0].appendChild(newCard);
        }
    }
    // if no cards
    catch(TypeError){
        checkTableEmpty("initiatorCardsTable");
        checkTableEmpty("receiverCardsTable");
    }
}

// move card to proper table on select
function selectCard(event, type, deselect){
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
}

// display message if no items in table
function checkTableEmpty(id){
    let contents = document.getElementById(id).getElementsByTagName("button");
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
        offeredCards.push(parseInt(card.innerHTML));
    }
    for(let card of requestTableCards){
        requestedCards.push(parseInt(card.innerHTML));
    }

    // make post request
    let xhr = new XMLHttpRequest();
    xhr.open("POST","/newTradeRequest", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        offer:offeredCards,
        request:requestedCards,
        sender_id:user1.id,
        receiver_id:user2.id
    }));
    // return to trade page
    window.location.href = window.location.protocol + "//" +
                            window.location.host + "/trade";
}