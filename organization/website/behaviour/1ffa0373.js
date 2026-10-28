

function openModule(button){

    const content = button.nextElementSibling;
    const icon = button.querySelector("i");

    if(content.classList.contains("active")){

        content.classList.remove("active");

        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");

    }else{

        content.classList.add("active");

        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");

    }

}


function openAllModules(){

    document.querySelectorAll(".module-content").forEach(function(content){

        content.classList.add("active");

    });

    document.querySelectorAll(".module-header i").forEach(function(icon){

        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");

    });

}


function closeAllModules(){

    document.querySelectorAll(".module-content").forEach(function(content){

        content.classList.remove("active");

    });

    document.querySelectorAll(".module-header i").forEach(function(icon){

        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");

    });

}


function toggleFaq(button){

    const answer = button.nextElementSibling;
    const icon = button.querySelector("i");

    if(answer.classList.contains("active")){

        answer.classList.remove("active");

        icon.classList.remove("fa-minus");
        icon.classList.add("fa-plus");

    }else{

        answer.classList.add("active");

        icon.classList.remove("fa-plus");
        icon.classList.add("fa-minus");

    }

}

