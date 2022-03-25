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

function doSort() { //handles sorting
    switch(sortType) {
        case 1:
            let imgEle;
            cardListOnScrn.sort((a,b) => {
                let x = a.name.toLowerCase();
                let y = b.name.toLowerCase();
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
            cardList.sort((a,b) => {
                let x = a.name.toLowerCase();
                let y = b.name.toLowerCase();
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
            break;
        case 2:
            cardListOnScrn.sort((a,b) => {
                let x = a.stars;
                let y = b.stars;
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
            cardList.sort((a,b) => {
                let x = a.stars;
                let y = b.stars;
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
            break;
        case 3:
            cardListOnScrn.sort((a,b) => {
                let x = a.value;
                let y = b.value;
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
            cardList.sort((a,b) => {
                let x = a.value;
                let y = b.value;
                if (x<y) {return -1;}
                if (x>y) {return 1;}
                return 0;
            });
    }
    let counter = 0;
    cardList.forEach((card, index)=>{
        if(index<cardListOnScrn.length) {
            imgEle = document.getElementById('aimg'+index);
            imgEle.src = cardListOnScrn[index].image;
            imgEle.alt = cardListOnScrn[index].name;
            imgEle.setAttribute('onclick',`relocate("${cardListOnScrn[index].name}")`)
        }
        if(uCardsOnScrn[card.card_id-1]>0) {
            for(i=0;i<uCardsOnScrn[card.card_id-1];i++) {
                counter++;
                imgEle = document.getElementById('uimg'+counter);
                imgEle.src = card.image;
                imgEle.alt = card.name;
                imgEle.setAttribute('onclick',`relocate("${card.name}")`)
            }
        }
    })
}

function searchAll(searchStr) {
    cardListOnScrn = [];
    cardList.forEach((card)=>{
        if(card.name.toLowerCase().includes(searchStr.toLowerCase())) {
            cardListOnScrn.push(card);
        }
    });
    let newLen = cardListOnScrn.length;
    document.getElementById('tableAll').remove();
    const newTable = document.createElement('table');
    newTable.className = 'displayTable';
    newTable.id = 'tableAll';
    document.getElementById('displayAll').appendChild(newTable);
    let tRows, tD, tImg;
    for(let i=0;i<newLen;i++) {
        if(i%4==0) {
            tRows = document.createElement('tr');
            newTable.appendChild(tRows);
        }
        tD = document.createElement('td');
        tD.style.textAlign = 'center';
        tImg = document.createElement('img');
        tImg.id='aimg'+i;
        tD.appendChild(tImg);
        tRows.appendChild(tD);
    }
    doSort();
}

function searchUsr(searchStr) {
    uCardsOnScrn.fill(0);
    let foundCount=0;
    cardList.forEach((card,index)=>{
        if(uCards[card.card_id-1]>0) {
            if(card.name.toLowerCase().includes(searchStr.toLowerCase())) {
                uCardsOnScrn[card.card_id-1] = uCards[card.card_id-1];
                foundCount += uCards[card.card_id-1];
            }
        }
    })
    document.getElementById('tableUsr').remove();
    const newTable = document.createElement('table');
    newTable.className = 'displayTable';
    newTable.id = 'tableUsr';
    const topDiv = document.getElementById('topDiv');
    document.getElementById('divOwned').insertBefore(newTable, topDiv);
    let tRows, tD, tImg;
    for(let i=0;i<foundCount;i++) {
        if(i%4==0) {
            tRows = document.createElement('tr');
            newTable.appendChild(tRows);
        }
        tD = document.createElement('td');
        tD.style.textAlign = 'center';
        tImg = document.createElement('img');
        tImg.id='uimg'+(i+1);
        tD.appendChild(tImg);
        tRows.appendChild(tD);
    }
    doSort();
}

function setSort(currentID) { //handles switching between sort types
    if(currentID.slice(1)!=sortType) {
        let toSelect = document.getElementsByClassName(currentID);
        for(let t of toSelect) {t.style.backgroundColor="rgb(200,200,200)";}
        if(sortType!=0) {
            let currentSelected = document.getElementsByClassName('s'+sortType);
            for(let c of currentSelected) {c.style.backgroundColor = "white";}
        }
        sortType = Number(currentID.slice(1));
        doSort();
    }
}