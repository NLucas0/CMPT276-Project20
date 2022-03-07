// setup user table on load
function adminSetUp(){
    for(let user of userData){
        let newRow = document.getElementById("adminSampleRow").cloneNode(true);

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
    let max_col = 4;
    let table = document.getElementById("adminTableInfoTable").getElementsByTagName("tbody")[0];

    for(let i=0; i < array.length; i++){
        let newRow = table.insertRow();

        for(let j = 0; j < max_col && i < array.length; j++){
            let newCell = newRow.insertCell();
            newCell.innerHTML = array[i];
            i++;
        }
    }
}

// search on input update
function search(event){
    let searchTerm = (event.target || event.srcElement).value;
    let userObj = userData.filter(x => x.name.includes(searchTerm)||String(x.id).includes(searchTerm));

}