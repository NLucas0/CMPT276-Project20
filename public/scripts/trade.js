let data;
let viewedTrades = false;
let activeTabColor = "#6f6f6f";
let deactivatedTabColor = "#434343";

// help popup contents
function help(hidden){
    document.getElementById("helpPagePopUp").hidden = hidden;
    if(hidden) return;

    document.getElementById("helpPageName").innerHTML = document.getElementsByTagName("h1")[2].innerHTML + " Page";
    document.getElementById("helpPageInfo").innerHTML = 
    '<hr>Click on <b>See Cards</b> to view an user\'s cards.</br>'+
    '</br>Click <b>Trade</b> to initiate trade. You will be redirected to the trade selection page</br><hr>' +

    'Type either a <b>ID</b> or <b>username</b> into the search bar to find an user.</br>' +
    '</br>Click <b>Ongoing Trades</b> to see trades sent to/from you.</br>' +

    '<hr>Click <b>Cards</b> to see the trade details.</br>' +
    '</br>Click <b>Cancel</b>, <b>Accept</b> or <b>Reject</b> to perform said action.</br>' +
    '</br>Click <b>Counter</b> to initiate a counter-trade. ' +
    'You will be redirected to the trade Selection Screen to edit trade details.</br>' +
    '(Note if you sent the trade, the accept/reject/counter options will not be visible)<hr>';
}

// setup tabs on load
function tradePageSetUp(){
    
    document.getElementsByClassName("helpButton")[0].hidden = false;
    data = getUserById(userId)
    setUpFriends();
    setUpUsers();
    setUpTrades();
    changeTab(0);
}

// initialize tables
function setUpRow(displayData, tableId, noMatchElement){
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
    let buttons = document.getElementsByClassName("tabButton");
    for(let i=0; i<tabs.length; i++){
        let check = i == parseInt(index);
        tabs[i].hidden = check? false:true;
        buttons[i].style.backgroundColor = check? activeTabColor:deactivatedTabColor;
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
        document.getElementById("tradeUserListAll").getElementsByClassName("noMatchMessage")[0].hidden = false;
        return;
    }
    else{
        document.getElementById("tradeUserListAll").getElementsByClassName("noMatchMessage")[0].hidden = true;
    }
}

// show/hide popup with additional information
function toggleTable(hidden, event, type=null, doc=document){
    // reset table if card viewer open
    try{
        if(type == 'iframe' || doc.getElementById("cardViewer")){
            doc.getElementById("cardViewer").remove();
            hideChildren(doc.getElementById("tradeTableInfoTable").getElementsByTagName("tbody")[0], false);
            
            doc.getElementById("tradeTableInfoTable").style.overflowY = "scroll";
            doc.getElementById("tradeTableInfoTable").style += "padding: %5;";

            // don't close if back button pressed
            if(type == 'iframe') return;
        }
    }
    catch(TypeError){}
    
    let eventObj = event.target || event.srcElement;

    // ignore clicks inside content
    if(eventObj == document.getElementById("tradeTableInfoTable") || 
        document.getElementById("tradeTableInfoTable").contains(eventObj)){
        return;
    }

    document.getElementById("tradeTableInfoPopUp").hidden = hidden || type =='trade';
    document.getElementById("adminTradeTableInfoPopUp").hidden = hidden || type !='trade';

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

            let newCard = document.getElementsByClassName("cardImgSample")[0].cloneNode(true);
            newCard.hidden = false;
            let newCell = newCard.getElementsByClassName("card")[0];
            newCell.src = (cardData.find(x=> x.card_id==array[i])).image;
            newCell.name = (cardData.find(x=> x.card_id==array[i])).name;
            newCell.data = array[i];
            newCell.onclick = function(event){showCardDetails(event);};
            table.prepend(newCard);  
            
        } 
        displayCards(array, table);
        
    }
    // if no data
    catch(error){
        table.getElementsByClassName("noMatchMessage")[0].hidden = false;
        table.insertBefore(table.getElementsByClassName("noMatchMessage")[0], table.getElementsByClassName("cardImgSample")[0]);
    }
}

// show card details in popup
function showCardDetails(event, hide=false){
    let cardName = (event.target || event.srcElement).name;

    // open card viewer in popup
    let iframe = document.createElement("iframe");
    iframe.id = "cardViewPopup";
    iframe.style = "width:100%; height:100%; display:block;";
    iframe.src = window.location.protocol + '/cardView/card/' + cardName;
    iframe.onclick = toggleTable(false, event, null);
    iframe.id = "cardViewer";

    document.getElementById("tradeTableInfoTable").style.overflowY = "hidden";
    document.getElementById("tradeTableInfoTable").style.padding = 0;

    // hide previous contents
    hideChildren(document.getElementById("tradeTableInfoTable").getElementsByTagName("tbody")[0]);
    document.getElementById("tradeTableInfoTable").prepend(iframe);
}

// set all children to hidden (ignore noMatchMessages)
function hideChildren(component, hidden=true){
    for(let child of component.children){
        if(child.className == "noMatchMessage"){continue;}
        child.hidden = hidden;
        hideChildren(child, hidden);
    }
}

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
            newItem.data = String(item);
            console.log(item);
        }
        table.appendChild(newItem);
    }
}

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



function displayCards(cards, container){
    // seperate duplicates
    let unique = [];
    let dupes = [];
    cards.forEach(item => {
        return unique.includes(item) ? dupes.push(item) : unique.push(item);
    });

    for(let cardObj of container.getElementsByClassName("cardImgSample")){
        let data = parseInt(cardObj.getElementsByClassName("card")[0].data);
        if(dupes.includes(data)){
            let count = 0;
            dupes.forEach(item=>{
                return item == data? count++:0;
            })
            let lbl = cardObj.getElementsByClassName("cardCount")[0];
            lbl.innerHTML = count;
            lbl.hidden = false;
            cardObj.appendChild(lbl)
        }
    }
}
