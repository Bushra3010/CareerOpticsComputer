

/* MOBILE MENU */

function toggleMobileMenu(){

    document
    .getElementById("mobileMenu")
    .classList.toggle("show");

}


function closeMobileMenu(){

    document
    .getElementById("mobileMenu")
    .classList.remove("show");

}


/* SYLLABUS ACCORDION */

function openModule(button){

    const module =
        button.closest(".module");

    const content =
        module.querySelector(".lesson-box");

    const arrow =
        module.querySelector(".lesson-arrow");


    /* Close all other modules */

    document.querySelectorAll(".lesson-box")
    .forEach(box => {

        if(box !== content){
            box.classList.remove("show");
        }

    });


    document.querySelectorAll(".lesson-arrow")
    .forEach(icon => {

        if(icon !== arrow){
            icon.classList.remove("rotate");
        }

    });


    content.classList.toggle("show");

    arrow.classList.toggle("rotate");

}

/* OPEN ALL MODULES */

function openAllModules(){

    document.querySelectorAll(".lesson-box")
    .forEach(box => {
        box.classList.add("show");
    });

    document.querySelectorAll(".lesson-arrow")
    .forEach(arrow => {
        arrow.classList.add("rotate");
    });

}

