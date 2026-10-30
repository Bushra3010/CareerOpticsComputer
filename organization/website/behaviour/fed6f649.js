

function openModule(number){

    const module = document.getElementById("module" + number);
    const icon = document.getElementById("icon" + number);

    if(module.classList.contains("active")){

        module.classList.remove("active");
        icon.textContent = "+";

    }else{

        module.classList.add("active");
        icon.textContent = "−";

    }

}


function openAllModules(){

    for(let i = 1; i <= 12; i++){

        const module = document.getElementById("module" + i);
        const icon = document.getElementById("icon" + i);

        if(module){
            module.classList.add("active");
        }

        if(icon){
            icon.textContent = "−";
        }

    }

}


function closeAllModules(){

    for(let i = 1; i <= 12; i++){

        const module = document.getElementById("module" + i);
        const icon = document.getElementById("icon" + i);

        if(module){
            module.classList.remove("active");
        }

        if(icon){
            icon.textContent = "+";
        }

    }

}


function toggleFaq(number){

    const answer = document.getElementById("faq" + number);
    const icon = document.getElementById("faqIcon" + number);

    if(answer.classList.contains("active")){

        answer.classList.remove("active");
        icon.textContent = "+";

    }else{

        answer.classList.add("active");
        icon.textContent = "−";

    }

}

