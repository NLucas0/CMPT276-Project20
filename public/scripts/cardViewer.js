function sTab(id) {
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

function relocate(cardName) {
    window.location.href = "/cardView/" + cardName;
}