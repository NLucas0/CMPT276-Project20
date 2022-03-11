let data;

function tradePageSetUp(){
    // logged in user data
    data = getUserById(userId)
    setUpFriends();
    setUpUsers();
}

// add friends to friends tab
function setUpFriends(){
    try{
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
    // if no friends
    catch(TypeError){
        document.getElementsByClassName("noMatchMessage")[0].hidden = false;
    }
}

// set up all users tab
function setUpUsers(){
    try{
        if(userData.length<=0){throw TypeError;}
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
    // if no users
    catch(TypeError){
        document.getElementsByClassName("noMatchMessage")[1].hidden = false;
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

    // hide/unhide users
    let count = 0;
    for(let user of users){
        let contains = user.getElementsByClassName("tradeName")[0].innerHTML.includes(inputValue);
        contains = contains||user.getElementsByClassName("tradeId")[0].innerHTML.includes(inputValue);
        user.hidden = !contains;
        count += contains;
    }

    // if no matching users
    if(count <= 0){
        document.getElementsByClassName("noMatchMessage")[1].hidden = false;
        return;
    }
    else{
        document.getElementsByClassName("noMatchMessage")[1].hidden = true;
    }
}

// show/hide popup with additional information
function toggleTable(hidden, event){
    // ignore clicks inside content
    if(document.getElementsByClassName("popupContents")[0].contains(event.target)){
        return;
    }
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

    try{
        for(let i=0; i<array.length; i++){
                let newCell = document.createElement("button");
                newCell.innerHTML = array[i];
                table.appendChild(newCell);
            
        }
    }
    // if no data
    catch(TypeError){
        document.getElementsByClassName("noMatchMessage")[2].hidden = false;
    }
}


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
    let originalTable = card.parentElement.id;
    document.getElementById(id).appendChild(card);
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