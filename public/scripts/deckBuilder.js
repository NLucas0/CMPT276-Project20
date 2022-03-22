function deckBuilderPageSetUp(){
    
    displayCards(document.getElementById("collectionCardsTable"), collection);
}

function displayCards(container, collection){
    try{
        console.log("Hello!");
        // add cards to right table and setup onclick event
        for(let i = 0; i < collection.length; i++){
            // let newCard = document.createElement("button");
            // newCard.className = "card";
            // newCard.innerHTML = card;
            // if(container.id == "collectionCardsTable"){
            //     newCard.onclick = function(event){selectCard(event, "OFFER", false);}
            // }
            // else{
            //     newCard.onclick = function(event){selectCard(event, "RECEIVE", false);}
            // }
            // container.getElementsByTagName("tbody")[0].appendChild(newCard);
        }
    }
    // if no cards
    catch(TypeError){
        
    }
}