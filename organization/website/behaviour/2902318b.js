

function openModule(number){

    const content = document.getElementById("module" + number);
    const arrow = document.getElementById("arrow" + number);

    if(!content || !arrow){
        return;
    }

    content.classList.toggle("active");
    arrow.classList.toggle("rotate");
}


function openAllModules(){

    for(let i = 1; i <= 12; i++){

        const content = document.getElementById("module" + i);
        const arrow = document.getElementById("arrow" + i);

        if(content){
            content.classList.add("active");
        }

        if(arrow){
            arrow.classList.add("rotate");
        }

    }

}


function toggleFaq(number){

    const answer = document.getElementById("faq" + number);
    const icon = document.getElementById("faqIcon" + number);

    if(!answer || !icon){
        return;
    }

    answer.classList.toggle("active");

    if(answer.classList.contains("active")){
        icon.textContent = "−";
    }else{
        icon.textContent = "+";
    }

}

