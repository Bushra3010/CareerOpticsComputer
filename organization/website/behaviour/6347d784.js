

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


/* FAQ */

function toggleFAQ(button){

    const answer =
        button.nextElementSibling;

    const icon =
        button.querySelector(".faq-icon");


    document.querySelectorAll(".faq-answer")
    .forEach(item => {

        if(item !== answer){
            item.classList.remove("show");
        }

    });


    document.querySelectorAll(".faq-icon")
    .forEach(item => {

        if(item !== icon){
            item.classList.remove("rotate");
        }

    });


    answer.classList.toggle("show");

    icon.classList.toggle("rotate");

}
