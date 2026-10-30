


/* =========================================================
MOBILE MENU
========================================================= */

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



/* =========================================================
SYLLABUS ACCORDION
ONE MODULE OPEN AT A TIME
========================================================= */

function openModule(button){

    const module =
        button.closest(".module");

    const content =
        module.querySelector(".module-content");

    const arrow =
        module.querySelector(".module-arrow");


    document
    .querySelectorAll(".module-content")
    .forEach(function(item){

        if(item !== content){

            item.classList.remove("show");

        }

    });


    document
    .querySelectorAll(".module-arrow")
    .forEach(function(item){

        if(item !== arrow){

            item.classList.remove("rotate");

        }

    });


    content.classList.toggle("show");

    arrow.classList.toggle("rotate");

}



/* =========================================================
OPEN ALL MODULES
========================================================= */

function openAllModules(){

    document
    .querySelectorAll(".module-content")
    .forEach(function(content){

        content.classList.add("show");

    });


    document
    .querySelectorAll(".module-arrow")
    .forEach(function(arrow){

        arrow.classList.add("rotate");

    });

}




/* =========================================================
CLOSE MOBILE MENU ON SCROLL
========================================================= */

window.addEventListener(
    "scroll",
    function(){

        const menu =
            document.getElementById("mobileMenu");

        if(menu){

            menu.classList.remove("show");

        }

    }
);

