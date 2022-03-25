let data;
let viewedTrades = false;

// setup tabs on load
function tradePageSetUp(){
    data = getUserById(userId)
    setUpFriends();
    setUpUsers();
    setUpTrades();
}

// initialize tables
function setUpRow(displayData, tableId, noMatchElement, classNames, attNames, events){
    try{
        // check for no data
        if(displayData == null || displayData.length <= 0){throw TypeError;}

        for(let user of displayData){
            // if list of ids, convert to object
            if(typeof user === 'number'){
                user = getUserById(user);
            }

            // skip self
            if(user.id == userId){continue;} 

            // set data attributes
            let newRow = document.getElementsByClassName("tradeSampleRow")[0].cloneNode(true);
            try{
                newRow.getElementsByClassName("tradeName")[0].innerHTML = user.name;
                newRow.getElementsByClassName("tradeId")[0].innerHTML = user.id;
                newRow.getElementsByClassName("tradeButton")[0].href ="/trade/tradeSelection/?user1="
                                            +encodeURIComponent(JSON.stringify(data))
                                            +"&user2="
                                            +encodeURIComponent(JSON.stringify(user))
                                            +"&counter=-1"
                                            +"&offered=0"
                                            +"&wanted=0";
        
                document.getElementById(tableId).appendChild(newRow);
            }
            catch(error){
                newRow.remove();
            }
        }
    }
    // if no friends
    catch(TypeError){
        noMatchElement.hidden = false;
    }
}

// add friends to friends tab
function setUpFriends(){
    setUpRow(data.friends, "tradeUserListFriends", document.getElementsByClassName("noMatchMessage")[2]);
}

// set up all users tab
function setUpUsers(){
    setUpRow(userData, "tradeUserListAll", document.getElementsByClassName("noMatchMessage")[3]);
}

// set up ongoing trades tab
function setUpTrades(){
    if(data.trades == null || data.trades.length < 1){
        let noTrades = document.getElementById("tradeTradesList").getElementsByClassName("noMatchMessage")[0];
        noTrades.hidden = false;
        return;
    }

    // make new row and update attributes
    for(let trade of data.trades){
        let newRow = document.getElementsByClassName("tradeSampleRow2")[0].cloneNode(true);
        newRow.getElementsByClassName("tradeId")[0].innerHTML = trade;
        let tradeObj = tradeData.find(x=> x.id == trade);

        newRow.getElementsByClassName("tradeStatus")[0].innerHTML = tradeObj.status;
        newRow.getElementsByClassName("tradeName")[0].innerHTML = getUserById(tradeObj.sender_id).name;

        if(tradeObj.sender_id == userId){
            newRow.getElementsByClassName("acceptButton")[0].parentElement.hidden = true;
            newRow.getElementsByClassName("rejectButton")[0].parentElement.hidden = true;
            newRow.getElementsByClassName("counterButton")[0].parentElement.hidden = true;
            
            newRow.getElementsByClassName("tradeName")[0].innerHTML = getUserById(tradeObj.receiver_id).name;
        }
        else{
            newRow.getElementsByClassName("cancelButton")[0].parentElement.hidden = true;
        }
        document.getElementById("tradeTradesList").appendChild(newRow);
    }
}

// hide all tabs except index
function changeTab(index){
    let tabs = document.getElementsByClassName("tab");
    for(let i=0; i<tabs.length; i++){
        tabs[i].hidden = i == parseInt(index)? false:true;
    }

    // remove accepted/rejected trades after viewing
    // change updated to pending
    if(index==2 && !viewedTrades){
        viewedTrades = true;
        for(let trade of document.getElementById("tradeTradesList").getElementsByClassName("tradeSampleRow2")){
            let status = trade.getElementsByClassName("tradeStatus")[0].innerHTML;
            let tradeId = trade.getElementsByClassName("tradeId")[0].innerHTML;

            if(status == 'ACCEPTED' || status == 'REJECTED'){
                post("trade/deleteTrade", {tradeId: tradeId});
            }
            else if(status == 'UPDATED'){
                if((tradeData.find(x=>x.id == tradeId)).sender_id == data.id){return;}
                post("trade/editTradeStatus", {newValue:"PENDING", tradeId: tradeId});
            }
        }
    }
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
        document.getElementsByClassName("noMatchMessage")[3].hidden = false;
        return;
    }
    else{
        document.getElementsByClassName("noMatchMessage")[3].hidden = true;
    }
}

// show/hide popup with additional information
function toggleTable(hidden, event, type=null){
    // ignore clicks inside content
    if(document.getElementsByClassName("popupContents")[0].contains(event.target)){
        return;
    }

    document.getElementById("tradeTableInfoPopUp").hidden = hidden || type=='trade';
    document.getElementById("adminTradeTableInfoPopUp").hidden = hidden || type!='trade';

    // get id of user and display data
    if(!hidden){
        let userId = (event.target || event.srcElement).parentElement.parentElement
                    .getElementsByClassName("tradeId")[0].innerHTML;
        
        if(type=='trade'){
            displayTrade(userId);
        }
        else{
            displayData(userId);
        }
    }
    else{
        // reset displayed data
        let resetData = '<tr><td class="noMatchMessage" hidden="true">No Cards</td></tr>';
        document.getElementsByClassName("adminTradeTableInfoPopUpTable")[0].getElementsByTagName("tbody")[0].innerHTML = resetData;
        document.getElementsByClassName("adminTradeTableInfoPopUpTable")[1].getElementsByTagName("tbody")[0].innerHTML = resetData;
        document.getElementById("tradeTableInfoTable").getElementsByTagName("tbody")[0].innerHTML = resetData;
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
            if(array[i] == 0){continue;}

            let newCell = document.createElement("img");
            newCell.src = (cardData.find(x=> x.card_id==array[i])).image;
            newCell.className = "card";
            table.appendChild(newCell);   
        }
    }
    // if no data
    catch(error){
        table.getElementsByClassName("noMatchMessage")[0].hidden = false;
    }
}

// refactor later
// add data to table
function addToTable(table, array, elementTag, className){
    if(array == null || array.length < 1){
        table.getElementsByClassName("noMatchMessage")[0].hidden = false;
        return;
    }
    
    for(let item of array){
        if(elementTag == "img" && item == 0){continue;}
        
        let newItem = document.createElement(elementTag);
        newItem.innerHTML = item;
        newItem.className = className;

        if(elementTag == "img"){
            newItem.src = (cardData.find(x=> x.card_id==item)).image;
        }
        table.appendChild(newItem);
    }
}

// refactor later
// display trade data in popup
function displayTrade(tradeId){
    let tradeObj = tradeData.find(x => x.id == parseInt(tradeId));
    let tables = document.getElementsByClassName("adminTradeTableInfoPopUpTable");

    // offered cards
    addToTable(tables[0].getElementsByTagName("tbody")[0], tradeObj.cards_offered, "img",
                "card");
    // wanted cards
    addToTable(tables[1].getElementsByTagName("tbody")[0], tradeObj.cards_wanted, "img",
                "card");
}

// accept/reject/cancel trade
async function tradeAction(event, type){
    let id = (event.target||event.srcElement).parentElement.parentElement.getElementsByClassName("tradeId")[0].innerHTML;

    // remove item
   // (event.target||event.srcElement).parentElement.parentElement.remove();
    
    // make post request
    if(type == 'CANCEL'){
        post("/trade/deleteTrade", {tradeId:id});
        window.location = window.location;
    }

    // issue counter trade
    else if(type == 'COUNTER'){
        let objData;
        for(let data of tradeData){
            if(data.id == id){
                objData = data;
                break;
            }
        }
        window.location = "/trade/tradeSelection/?user1="
                            +encodeURIComponent(JSON.stringify(getUserById(objData.receiver_id)))
                            +"&user2="
                            +encodeURIComponent(JSON.stringify(getUserById(objData.sender_id)))
                            +"&counter="
                            + objData.id
                            +"&offered="
                            + JSON.stringify(objData.cards_offered)
                            +"&wanted="
                            + JSON.stringify(objData.cards_wanted);
    }
    else{
        window.location = window.location;
        let response = await fetch(window.location.protocol + "//" + window.location.host + "/trade/editTradeStatus",{
            method: 'POST',
            body: JSON.stringify({
                newValue: type,
                tradeId: id
            }),
            headers: {"Content-Type": "application/json", 'Accept':'application/json'}
        });
        if(response.status == 400){
            alert('Either you or the other party do not have the required cards. Trade cancelled.');
        }
        else{
            alert('Trade '+newValue);
        }
    }
}

// send post request
function post(endpoint, data){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}
