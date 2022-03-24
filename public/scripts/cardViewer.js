function sTab(id) { //handling the switching between view modes
    if(id=='tabD') {
        let tabD = document.getElementById(id);
        let tabS = document.getElementById('tabS');
        tabD.style.backgroundColor = "rgb(240,240,240)";
        tabD.id = 'tabS';
        tabS.style.backgroundColor = "white";
        tabS.id = 'tabD';
        if(tabD.innerHTML == 'View owned cards') {
            document.getElementById('displayAll').style.display = "none";
            document.getElementById('displayOwned').style.display = "block";  
        } else {
            document.getElementById('displayAll').style.display = "block";
            document.getElementById('displayOwned').style.display = "none";
        }
    }
}

function relocate(cardName) { //redirect to card info page
    window.location.href = "/cardView/" + cardName;
}

function search() { //handles searching

}

function doSort(sType, cL, uC) { //handles sorting
    switch(sType) {
        case 1:
            let imgEle;
            cL.sort((a,b) => {
                let x = a.name.toLowerCase();
                let y = b.name.toLowerCase();
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
            break;
        case 2:
            cL.sort((a,b) => {
                let x = a.stars;
                let y = b.stars;
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
            break;
        case 3:
            cL.sort((a,b) => {
                let x = a.value;
                let y = b.value;
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
    }
    let counter = 0;
    cL.forEach((card, index)=>{
        imgEle = document.getElementById('aimg'+index);
        imgEle.src = card.image;
        imgEle.alt = card.name;
        imgEle.setAttribute('onclick',`relocate('${card.name}')`)
        if(uC[card.card_id-1]>0) {
            for(i=0;i<uC[card.card_id-1];i++) {
                counter++;
                imgEle = document.getElementById('uimg'+counter);
                imgEle.src = card.image;
                imgEle.alt = card.name;
                imgEle.setAttribute('onclick',`relocate('${card.name}')`)
            }
        }
    })
}

function setSort(currentID, sortState, cList, userCards) { //handles switching between sort types
    if(currentID.slice(1)!=sortState) {
        let toSelect = document.getElementsByClassName(currentID);
        for(let t of toSelect) {t.style.backgroundColor="rgb(200,200,200)";}
        if(sortState!=0) {
            let currentSelected = document.getElementsByClassName('s'+sortState);
            for(let c of currentSelected) {c.style.backgroundColor = "white";}
        }
        sortType = Number(currentID.slice(1));
        doSort(sortType, cList, userCards);
    }
}