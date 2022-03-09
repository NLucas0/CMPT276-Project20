// setup user table on load
function adminSetUp(){
    for(let user of userData){
        let newRow = document.getElementsByClassName("adminSampleRow")[0].cloneNode(true);

        newRow.getElementsByClassName("id")[0].innerHTML = user.id;
        newRow.getElementsByClassName("username")[0].innerHTML = user.name;
        newRow.getElementsByClassName("password")[0].innerHTML = user.password;
        
        newRow.getElementsByClassName("type")[0].innerHTML = user.type;

        document.getElementById("userTable").appendChild(newRow);
    }
}

// show/hide popup with additional information
function toggleTable(hidden, col, event){
    document.getElementById("adminTableInfoPopUp").hidden = hidden;

    // get id of user and display data
    if(!hidden){
        document.getElementById("adminTableInfoHeader").innerHTML = col;
        let userId = (event.target || event.srcElement).parentElement.parentElement
                    .getElementsByClassName("id")[0].innerHTML;
        displayData(col, userId);
    }
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

// update search results with text input
function search(event){
    let inputValue = (event.target||event.srcElement).value;
    let users = document.getElementById("userTable").getElementsByClassName("adminSampleRow");

    for(let user of users){
        let contains = user.getElementsByClassName("username")[0].innerHTML.includes(inputValue);
        contains = contains||user.getElementsByClassName("id")[0].innerHTML.includes(inputValue);
        user.hidden = !contains;
    }
}

// filter results by user type
function toggleUserType(event){
    let checkbox = event.target||event.srcElement;
    let users = document.getElementById("userTable").getElementsByClassName("adminSampleRow");
    
    for(let user of users){
        if(user.getElementsByClassName("type")[0].innerHTML == checkbox.value){
            user.hidden = !checkbox.checked;
        }
    }
}