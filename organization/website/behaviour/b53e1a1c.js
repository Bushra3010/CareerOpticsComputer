

/* ==========================================
   SYLLABUS APP MENU
========================================== */

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

            if(window.innerWidth < 900){

                selectedModule.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });

            }

        }

    });

});



/* ==========================================
   MOBILE MENU
========================================== */

const menuBtn =
document.getElementById("menuBtn");

const mobileNav =
document.getElementById("mobileNav");


menuBtn.addEventListener("click", () => {

    if(mobileNav.style.display === "block"){

        mobileNav.style.display = "none";

        menuBtn.innerHTML =
        '<i class="fa-solid fa-bars"></i>';

    }else{

        mobileNav.style.display = "block";

        menuBtn.innerHTML =
        '<i class="fa-solid fa-xmark"></i>';

    }

});


/* Close mobile menu after clicking link */

document.querySelectorAll("#mobileNav a")
.forEach(link => {

    link.addEventListener("click", () => {

        mobileNav.style.display = "none";

        menuBtn.innerHTML =
        '<i class="fa-solid fa-bars"></i>';

    });

});



/* ==========================================
   FORM
========================================== */

document.getElementById("admissionForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    const message =
    document.getElementById("formMessage");

    message.classList.remove("hidden");

    this.reset();

    setTimeout(() => {

        message.classList.add("hidden");

    },5000);

});



/* ==========================================
   SMOOTH SCROLL
========================================== */

document.querySelectorAll('a[href^="#"]')
.forEach(anchor => {

    anchor.addEventListener("click", function(e){

        const target =
        document.querySelector(this.getAttribute("href"));

        if(target){

            e.preventDefault();

            target.scrollIntoView({
                behavior:"smooth"
            });

        }

    });

});

