// setup user table on load
function adminSetUp(){
    try{
        // add all user data to table
        for(let user of userData){
            let newRow = document.getElementsByClassName("adminSampleRow")[0].cloneNode(true);

            newRow.getElementsByClassName("id")[0].innerHTML = user.id;
            newRow.getElementsByClassName("username")[0].innerHTML = user.name;
            newRow.getElementsByClassName("password")[0].innerHTML = user.password;
            
            newRow.getElementsByClassName("type")[0].innerHTML = user.type;

            document.getElementById("userTable").appendChild(newRow);
        }
    }
    // if no users
    catch(TypeError){
        document.getElementsByClassName("noMatchMessage")[0].hidden = false;
    }
}

// show/hide popup with additional information
function toggleTable(hidden, col, event){
    // ignore clicks inside content
    if(document.getElementsByClassName("popupContents")[0].contains(event.target)){
        return;
    }

    document.getElementById("adminTableInfoPopUp").hidden = hidden;

    // get id of user and display data
    if(!hidden){
        document.getElementById("adminTableInfoHeader").innerHTML = col;
        let userId = (event.target || event.srcElement).parentElement.parentElement
                    .getElementsByClassName("id")[0].innerHTML;
        displayData(col, userId);
    }
    // reset displayed data
    else{
        document.getElementById("adminTableInfoTable").getElementsByTagName("tbody")[0].innerHTML = '';
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
    let table = document.getElementById("adminTableInfoTable").getElementsByTagName("tbody")[0];

    try{
        for(let i=0; i < array.length; i++){
            if(col != "Owned Cards"){
                newCell = document.createElement("label");
            }
            else{
                newCell = document.createElement("button");
            }
            newCell.innerHTML = array[i];
            table.appendChild(newCell);
        }
    }
    // if no data
    catch(TypeError){
        let lbl = document.createElement("label");
        lbl.innerHTML = "Nothing to Show";
        table.appendChild(lbl);
    }
}

// hide/unhide users according to checkboxes and searchbox
function filterUsers(){
    let searchTerm = document.getElementById("searchBox").value;
    let adminBox = document.getElementById("adminCheckbox1").checked;
    let userBox = document.getElementById("adminCheckbox2").checked;
    let users = document.getElementById("userTable").getElementsByClassName("adminSampleRow");
    
    document.getElementsByClassName("noMatchMessage")[0].hidden = false;

    // check each user for matching substring
    for(let user of users){
        // check search term
        let searchCheck = user.getElementsByClassName("username")[0].innerHTML.includes(searchTerm);
        searchCheck = searchCheck||user.getElementsByClassName("id")[0].innerHTML.includes(searchTerm);

        // check account type
        let typeCheck = adminBox && user.getElementsByClassName("type")[0].innerHTML == "ADMIN";
        typeCheck = typeCheck  || (userBox && user.getElementsByClassName("type")[0].innerHTML == "USER");

        user.hidden = !(searchCheck && typeCheck);

        // if at least one user is shown, hide "no data" message
        if(!user.hidden){
            document.getElementsByClassName("noMatchMessage")[0].hidden = true;
        }
    }
}