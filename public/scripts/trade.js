let data;

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
        if(displayData.length<=0){throw TypeError;}

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
                newRow.getElementsByClassName("tradeButton")[0].href ="/tradeSelection/?user1="
                                            +encodeURIComponent(JSON.stringify(data))
                                            +"&user2="
                                            +encodeURIComponent(JSON.stringify(user));
        
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
    setUpRow(data.friends, "tradeUserListFriends", document.getElementsByClassName("noMatchMessage")[0]);
}

// set up all users tab
function setUpUsers(){
    setUpRow(userData, "tradeUserListAll", document.getElementsByClassName("noMatchMessage")[1]);
}

// set up ongoing trades tab
function setUpTrades(){
    for(let trade of data.trades){
        let newRow = document.getElementsByClassName("tradeSampleRow2")[0].cloneNode(true);
        document.getElementById("tradeTradesList").appendChild(newRow);
    }
}

// hide all tabs except index
function changeTab(index){
    let tabs = document.getElementsByClassName("tab");
    for(let i=0; i<tabs.length; i++){
        tabs[i].hidden = i == parseInt(index)?false:true;
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
                newCell.className = "card";
                table.appendChild(newCell);
            
        }
    }
    // if no data
    catch(TypeError){
        document.getElementsByClassName("noMatchMessage")[2].hidden = false;
    }
}
