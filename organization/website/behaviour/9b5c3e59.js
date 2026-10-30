


/* =====================================================
MOBILE MENU
===================================================== */

function toggleMobileMenu(){

    const menu =
        document.getElementById("mobileMenu");

    menu.classList.toggle("show");

}


function closeMobileMenu(){

    const menu =
        document.getElementById("mobileMenu");

    menu.classList.remove("show");

}


/* =====================================================
COURSE ACCORDION
Only one module open at a time
===================================================== */

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


/* =====================================================
OPEN ALL MODULES
===================================================== */

function openAllModules(){

    const boxes =
        document.querySelectorAll(".lesson-box");

    const arrows =
        document.querySelectorAll(".lesson-arrow");


    boxes.forEach(box => {

        box.classList.add("show");

    });


    arrows.forEach(arrow => {

        arrow.classList.add("rotate");

    });

}


/* =====================================================
FAQ ACCORDION
===================================================== */

function toggleFAQ(button){

    const answer =
        button.nextElementSibling;

    const icon =
        button.querySelector(".faq-icon");


    const allAnswers =
        document.querySelectorAll(".faq-answer");

    const allIcons =
        document.querySelectorAll(".faq-icon");


    allAnswers.forEach(item => {

        if(item !== answer){

            item.classList.remove("show");

        }

    });


    allIcons.forEach(item => {

        if(item !== icon){

            item.classList.remove("rotate");

        }

    });


    answer.classList.toggle("show");

    icon.classList.toggle("rotate");

}



window.addEventListener("scroll", function(){

    const menu =
        document.getElementById("mobileMenu");

    if(menu){

        menu.classList.remove("show");

    }

});

