let data;

function tradePageSetUp(){
    // logged in user data
    data = getUserById(userId)
    setUpFriends();
    setUpUsers();
}

// add friends to friends tab
function setUpFriends(){
    for(let friend of data.friends){
        let newRow = document.getElementsByClassName("tradeSampleRow")[0].cloneNode(true);
        try{
            // set data attributes
            newRow.getElementsByClassName("tradeName")[0].innerHTML = getUserById(friend).name;
            newRow.getElementsByClassName("tradeId")[0].innerHTML = getUserById(friend).id;
            newRow.getElementsByClassName("tradeButton")[0].href ="/tradeSelection/?user1="
                                        +encodeURIComponent(JSON.stringify(getUserById(userId)))
                                        +"&user2="
                                        +encodeURIComponent(JSON.stringify(getUserById(friend)));

            document.getElementById("tradeUserListFriends").appendChild(newRow);
        }
        catch(error){
            newRow.remove();
        }
    }
}

// set up all users tab
function setUpUsers(){
    for(let user of userData){
        if(user.id == userId){continue;} // skip self

        let newRow = document.getElementsByClassName("tradeSampleRow")[0].cloneNode(true);
        // set data attributes
        newRow.getElementsByClassName("tradeName")[0].innerHTML = user.name;
        newRow.getElementsByClassName("tradeId")[0].innerHTML = user.id;
        newRow.getElementsByClassName("tradeButton")[0].href ="/tradeSelection/?user1="
                                                    +encodeURIComponent(JSON.stringify(getUserById(userId)))
                                                    +"&user2="
                                                    +encodeURIComponent(JSON.stringify(user));

        document.getElementById("tradeUserListAll").appendChild(newRow);
    }
}

// tabs
function changeTab(type){
    document.getElementById("tradeUserListAll").hidden = type =="friends";
    document.getElementById("tradeUserListFriends").hidden = type !="friends";
}

// return user data object from id
function getUserById(id){
    return userData.find(x => x.id==id)
}

// update search results with text input
function search(event){
    let inputValue = (event.target||event.srcElement).value;
    let users = document.getElementById("tradeUserListAll").getElementsByClassName("tradeSampleRow");

    for(let user of users){
        let contains = user.getElementsByClassName("tradeName")[0].innerHTML.includes(inputValue);
        contains = contains||user.getElementsByClassName("tradeId")[0].innerHTML.includes(inputValue);
        user.hidden = !contains;
    }
}

// show/hide popup with additional information
function toggleTable(hidden, event){
    document.getElementById("tradeTableInfoPopUp").hidden = hidden;

    // get id of user and display data
    if(!hidden){
        let userId = (event.target || event.srcElement).parentElement.parentElement
                    .getElementsByClassName("tradeId")[0].innerHTML;
        displayData(userId);
    }
    else{
        document.getElementById("tradeTableInfoTable").getElementsByTagName("tbody")[0].innerHTML = '';
    }
}

// display column data in popup
function displayData(userId){
    let userObj = userData.find(x => x.id == parseInt(userId));

    // get correct array
    let array = userObj.cards;
    if(!array){return;}

    // display items
    let table = document.getElementById("tradeTableInfoTable").getElementsByTagName("tbody")[0];

    for(let i=0; i<array.length; i++){
            let newCell = document.createElement("button");
            newCell.innerHTML = array[i];
            table.appendChild(newCell);
        
    }
}



// trade selection
function tradeSelectionPageSetUp(){
    displayCards(document.getElementById("initiatorCardsTable"), user1.cards);
    displayCards(document.getElementById("receiverCardsTable"), user2.cards);
}

// display cards
function displayCards(container, cards){
    for(let card of cards){
        let newCard = document.createElement("button");
        newCard.innerHTML = card;
        if(container.id == "initiatorCardsTable"){
            newCard.onclick = function(event){selectCard(event, "OFFER", false);}
        }
        else{
            newCard.onclick = function(event){selectCard(event, "RECEIVE", false);}
        }
        container.appendChild(newCard);
    }
}

// select card
function selectCard(event, type, deselect){
    let card = event.target||event.srcElement;
    let id;
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
    document.getElementById(id).appendChild(card);
    card.onclick = function(event){selectCard(event, type, !deselect);};
}