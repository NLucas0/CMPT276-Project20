let ADMIN_PASSWORD = "password";

// setup tabs on load
function adminSetUp(){
    setUpUserTab();
    setUpTradeTab();
}

// setup user table on load
function setUpUserTab(){
    setUpTable("adminUserSampleRow", ["id", "username", "password", "type"],
    ["id", "name", "password", "type"], "userTable", userData);
}

// setup user table on load
function setUpTradeTab(){
    setUpTable("adminTradeSampleRow", ["tradeId", "senderId", "receiverId", "tradeStatus"],
    ["id", "sender_id", "receiver_id", "status"], "tradeTable", tradeData);
}

// generic set up table function
function setUpTable(sampleRowId, classNames, properties, tableId, data){
    try{
        // add all data to table
        for(let item of data){
            let newRow = document.getElementsByClassName(sampleRowId)[0].cloneNode(true);

            // set col values
            for(let i = 0; i < classNames.length; i++){
                if(classNames[i]=="tradeStatus"){
                    newRow.getElementsByClassName(classNames[i])[0].value = item[properties[i]];
                    continue;
                }
                newRow.getElementsByClassName(classNames[i])[0].innerHTML = item[properties[i]];
            }
            document.getElementById(tableId).appendChild(newRow);
        }
    }
    // if no data
    catch(TypeError){
        document.getElementsByClassName("noMatchMessage")[0].hidden = false;
    }
}

// hide all tabs except index
function changeTab(index){
    let tabs = document.getElementsByClassName("tab");
    for(let i=0; i<tabs.length; i++){
        tabs[i].hidden = i == parseInt(index)?false:true;
    }
}

// show/hide popup with additional information
function toggleTable(hidden, col, event, type){
    // ignore clicks inside content
    if(document.getElementsByClassName("popupContents")[0].contains(event.target)||
        document.getElementsByClassName("popupContents")[1].contains(event.target)){
        return;
    }

    let popup = type == "user"? document.getElementById("adminUserTableInfoPopUp"):
                                document.getElementById("adminTradeTableInfoPopUp");
    popup.hidden = hidden;

    // display data in correct popup
    if(!hidden){
        if(type == "user"){
            document.getElementById("adminTableInfoHeader").innerHTML = col;
            let userId = (event.target || event.srcElement).parentElement.parentElement
                            .getElementsByClassName("id")[0].innerHTML;
            displayData(col, userId);
        }
        else{
            let tradeId = (event.target || event.srcElement).parentElement.parentElement
                            .getElementsByClassName("tradeId")[0].innerHTML;
            displayTradeData(tradeId);
        }
    }
    // reset displayed data
    else{
        document.getElementById("adminTableInfoTable")
                .getElementsByTagName("tbody")[0].innerHTML = '';
        document.getElementsByClassName("adminTradeTableInfoPopUpTable")[0]
                .getElementsByTagName("tbody")[0].innerHTML = '';
        document.getElementsByClassName("adminTradeTableInfoPopUpTable")[1]
                .getElementsByTagName("tbody")[0].innerHTML = '';
    }
}

// display column data in popup
function displayData(col, userId){
    let userObj = userData.find(x => x.id == parseInt(userId));

    // get correct array
    let array;
    switch(col){
        case "Owned Cards":
            array = userObj.cards;
            break;
        case "Friends":
            array = userObj.friends;
            break;
        default:
            array = userObj.trades;
    }

    // display items
    try{
        let table = document.getElementById("adminTableInfoTable").
                                getElementsByTagName("tbody")[0];
        let elementTag = col != "Owned Cards"? "label":"button";
        let className = col != "Owned Cards"? "": "card";
        addToTable(table, array, elementTag, className);
    }
    // if no data
    catch(TypeError){
        let lbl = document.createElement("label");
        lbl.innerHTML = "Nothing to Show";
        table.appendChild(lbl);
    }
}

// display trade offered/wanted cards in popup
function displayTradeData(tradeId){
    let tradeObj = tradeData.find(x => x.id == parseInt(tradeId));
    let tables = document.getElementsByClassName("adminTradeTableInfoPopUpTable");

    // offered cards
    addToTable(tables[0].getElementsByTagName("tbody")[0], tradeObj.cards_offered, "button",
                "card");
    // wanted cards
    addToTable(tables[1].getElementsByTagName("tbody")[0], tradeObj.cards_wanted, "button",
                "card");
}

// add data to table
function addToTable(table, array, elementTag, className){
    if(array == null){return;}
    for(let item of array){
        let newItem = document.createElement(elementTag);
        newItem.innerHTML = item;
        newItem.className = className;
        table.appendChild(newItem);
    }
}

// hide/unhide users according to checkboxes and searchbox
function filterUsers(){
    let searchTerm = document.getElementById("searchBox").value;
    let adminBox = document.getElementById("adminCheckbox1").checked;
    let userBox = document.getElementById("adminCheckbox2").checked;
    let users = document.getElementById("userTable").getElementsByClassName("adminUserSampleRow");
    
    document.getElementsByClassName("noMatchMessage")[0].hidden = false;

    // check each user for matching substring
    for(let user of users){
        // check search term and type
        let searchCheck = checkSearch(user, searchTerm);
        let typeCheck = checkType(user, adminBox, userBox);
        
        user.hidden = !(searchCheck && typeCheck);

        // if at least one user is shown, hide "no data" message
        if(!user.hidden){
            document.getElementsByClassName("noMatchMessage")[0].hidden = true;
        }
    }
}

// return true if user has searchTerm in username or id
function checkSearch(user, searchTerm){
    let searchCheck = user.getElementsByClassName("username")[0].innerHTML.includes(searchTerm);
    searchCheck = searchCheck||user.getElementsByClassName("id")[0].innerHTML.includes(searchTerm);
    return searchCheck;
}

// return true if user fits type criteria
function checkType(user, admin, regular){
    let type = user.getElementsByClassName("type")[0].innerHTML;
    let typeCheck = admin && type == "ADMIN";
    typeCheck = typeCheck  || (regular && type == "USER");
    return typeCheck;
}

// modify trade status in database
function changeTradeStatus(event){
    alert("Trade Status Updated");
    let select = (event.target||event.srcElement);
    let id = select.parentElement.parentElement.getElementsByClassName("tradeId")[0].innerHTML;

    // make post request
    post("/trade/editTradeStatus", {newValue:select.value, tradeId:id});
}

// delete trade from database
function deleteTrade(event){
    if(!confirm("Delete trade?")){return;}
    let select = event.target||event.srcElement;
    let id = select.parentElement.parentElement.getElementsByClassName("tradeId")[0].innerHTML;
    post("/trade/deleteTrade", {tradeId:id});
    select.parentElement.parentElement.remove();
    
    // reload page to get updated database
    window.location.href = window.location.href;
}

// delete user data from database
function deleteUser(event){
    // confirm deletion
    let input = prompt("Please enter password to delete user", "password");
    if(input != ADMIN_PASSWORD){
        alert("Incorrect password");
        return;
    }
    
    let select = event.target||event.srcElement;
    let id = select.parentElement.parentElement.getElementsByClassName("id")[0].innerHTML;
    post("/deleteUser", {userId:id});
    select.parentElement.parentElement.remove();
}

// make post request
// 500 returned if invalid trade attempted
// source: https://stackoverflow.com/questions/6396101/pure-javascript-send-post-data-without-a-form
async function post(endpoint, data){
    let response = await fetch("http://" + window.location.host + endpoint,{
        method: 'POST',
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    })
    if(response.status == 500){
        alert('Error: invalid trade');
        window.location.href = window.location.href;
    }
}