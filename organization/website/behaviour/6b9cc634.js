


/* =========================================================
   MODULE APP MENU
========================================================= */

document.querySelectorAll(".module-btn").forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.module;

        document.querySelectorAll(".module-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

        document.querySelectorAll(".module-content")
        .forEach(content => {
            content.classList.remove("active");
        });

        button.classList.add("active");

        const selectedModule =
        document.getElementById(target);

        if(selectedModule){
            selectedModule.classList.add("active");
        }

    });

});



/* =========================================================
   MOBILE MENU
========================================================= */

const menuBtn =
document.getElementById("menuBtn");

const mobileMenu =
document.getElementById("mobileMenu");


menuBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("hidden");

});


document.querySelectorAll("#mobileMenu a")
.forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.add("hidden");

    });

});



/* =========================================================
   FORM
========================================================= */

const admissionForm =
document.getElementById("admissionForm");

const successMessage =
document.getElementById("successMessage");


admissionForm.addEventListener("submit", function(e){

    e.preventDefault();

    successMessage.classList.remove("hidden");

    admissionForm.reset();

    window.scrollTo({
        top: document.getElementById("admission").offsetTop - 80,
        behavior: "smooth"
    });

});



/* =========================================================
   SMOOTH ANCHOR SCROLL
========================================================= */

document.querySelectorAll('a[href^="#"]')
.forEach(anchor => {

    anchor.addEventListener("click", function(e){

        const target =
        document.querySelector(this.getAttribute("href"));

        if(target){

            e.preventDefault();

            target.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });

        }

    });

});

