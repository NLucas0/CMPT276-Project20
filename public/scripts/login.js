// move focus to next text input or submit form
function goToNext(id, event){
    if(event.key != 'Enter' && event.type != 'click'){
        console.log("test");
        return;
    }
    if(id=="submit"){
        document.getElementById("loginForm").submit();
        return;
    }
    document.getElementById(id).focus();
}