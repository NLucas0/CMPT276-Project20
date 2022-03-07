function tradePageSetUp(){
    setUpFriends();
}

// add friends to friends tab
function setUpfriends(){
    for(let friend of data.friends){
        let newRow = document.getElementById("tradeSampleRow").cloneNode(true);
        try{
            newRow.getElementsByClassName("tradeName")[0].innerHTML = getUserById(friend).name;
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
        let newRow = document.getElementById("tradeSampleRow").cloneNode(true);
        newRow.getElementsByClassName("tradeName")[0].innerHTML = user.name;
        document.getElementById("tradeUserListAll").appendChild(newRow);
    }
}

// tabs
function changeTab(event, type){
    document.getElementById("tradeUserListAll").hidden = type =="friends";
    document.getElementById("tradeUserListFriends").hidden = type !="friends";
}

// return user data object from id
function getUserById(id){
    return userData.find(x => x.id==id)
}

function getCards(id){

}

// logged in user data
let data = getUserById(userId);