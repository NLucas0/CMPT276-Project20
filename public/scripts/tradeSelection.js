let activeTabColor = "#6f6f6f";
let deactivatedTabColor = "#434343";

let ascendingSort = true;
let sortAtt = "name";
let selectedTab = null;

// help popup contents
function help(hidden){
    document.getElementById("helpPagePopUp").hidden = hidden;
    if(hidden) return;

    document.getElementById("helpPageName").innerHTML = document.getElementsByTagName("h1")[2].innerHTML + " Page";
    document.getElementById("helpPageInfo").innerHTML = 
    '<hr class="helpHr">To offer cards to the other user, click cards from <b>Owned Cards</b>. '+
    'From <b>Trader\'s Cards</b>, click cards you want in exchange.</br></br>' +
    'Cards you have selected to give are displayed in the <b>Offer</b> table. '+
    'Cards you have selected to request are displayed in the <b>Request</b> table.</br></br>' +
    'To move cards between tables, simply click on the image.</br></br>' +
    'The total value of each side of the trade is displayed above the respective table.</br><hr class="helpHr">'+
    'To confirm and send the trade request, click <b>Send Trade Request</b></br></br>' +

    'To see card details, <b>right click</b> on the card</br></br>' +
    'To sort cards, click either <b>Value</b>, <b>Stars</b> or <b>Name</b>. To reverse the sort, click the button again.<hr class="helpHr">';
}

// trade selection
function tradeSelectionPageSetUp(){
    document.getElementsByClassName("helpButton")[0].hidden = false;

    displayCards(document.getElementById("initiatorCardsTable"), user1.cards);
    displayCards(document.getElementById("receiverCardsTable"), user2.cards);
    sortCards(0);

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

// show card details in popup
function showCardDetails(event, hide=false){
    event.preventDefault();
    document.getElementById("tradeSelectionInfoPopUp").hidden = hide;
    document.getElementById("tradeSelectionCardViewer").hidden = hide;
    
    if(hide){
        return;
    }
    let cardName = (event.target || event.srcElement).name;
    // open card viewer in popup
    document.getElementById("tradeSelectionCardViewer").src = window.location.protocol + '/cardView/card/' + cardName;
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
            newCard.name = (cardData.find(x=>x.card_id == card)).name;
            newCard.src = "/" + (cardData.find(x=>x.card_id == card)).image;

            // set up click events
            if(container.id == "initiatorCardsTable"){
                newCard.onclick = function(event){selectCard(event, "OFFER", false, card);}
            }
            else{
                newCard.onclick = function(event){selectCard(event, "RECEIVE", false, card);}
            }
            newCard.oncontextmenu = function(event){showCardDetails(event, false);}
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
    sortAll();
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

// sort displayed cards (selection sort)
function displaySort(container){
    console.log('here');
    let array = Array.from(container.getElementsByClassName("card"));
    let prevElement = null;

    for(let i=0; i<array.length; i++){
        let minElement = array[i];
        let minObj = (cardData.find(x=> x.card_id == minElement.data));
        let minIndex = i;

        for(let j=i; j<array.length; j++){
            if((ascendingSort && minObj[sortAtt] >= (cardData.find(x=> x.card_id == array[j].data))[sortAtt])||
                (!ascendingSort && minObj[sortAtt] <= (cardData.find(x=> x.card_id == array[j].data))[sortAtt]))
            {
                minElement = array[j];
                minIndex = j;
            }
        }
        if(prevElement == null){
            container.prepend(minElement);
        }
        else{
            prevElement.parentNode.insertBefore(minElement, prevElement.nextSibling);
        }
        prevElement = minElement;

        // move moved element to front of array
        array.splice(minIndex, 1);
        array.unshift(minElement);
        console.log(minObj['name']+minObj['value']);
    }

    container.append(container.getElementsByClassName("noMatchMessage")[0].parentElement);
}

function sortAll(){
    displaySort(document.getElementById("initiatorCardsTable").getElementsByTagName("tbody")[0]);
    displaySort(document.getElementById("offeredCardsTable").getElementsByTagName("tbody")[0]);
    
    displaySort(document.getElementById("wantedCardsTable").getElementsByTagName("tbody")[0]);
    displaySort(document.getElementById("receiverCardsTable").getElementsByTagName("tbody")[0]);
}

function sortCards(index){
    let tabs = document.getElementsByClassName("tabButton");

    // if already selected, reverse sort
    if(selectedTab != null && selectedTab==tabs[index]){
        ascendingSort = !ascendingSort;
    }
    else{
        // change tab colors
        for(let i=0; i<tabs.length; i++){
            tabs[i].style.backgroundColor = index==i?activeTabColor:deactivatedTabColor;
        }
        
        // update search attribute
        switch(index){
            case 0: // name
                sortAtt = "name";
                break;
            case 1: // stars
                sortAtt = "stars";
                break;
            case 2: // value
                sortAtt = "value";
                break;
        }
    }

    sortAll();
    selectedTab = tabs[index];
}
