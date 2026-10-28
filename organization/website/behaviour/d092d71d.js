

/* =========================================
MODULE SWITCHING
========================================= */

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

            if(window.innerWidth <= 900){

                document.getElementById("syllabus")
                .scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });

            }

        }

    });

});


/* =========================================
FAQ
========================================= */

document.querySelectorAll(".faq-question")
.forEach(button => {

    button.addEventListener("click", () => {

        const item = button.parentElement;

        document.querySelectorAll(".faq-item")
        .forEach(other => {

            if(other !== item){
                other.classList.remove("open");
            }

        });

        item.classList.toggle("open");

    });

});


/* =========================================
ADMISSION FORM
========================================= */

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


/* =========================================
ACTIVE NAV ON SCROLL
========================================= */

const sections =
document.querySelectorAll("section[id]");

const navLinks =
document.querySelectorAll("header a[href^='#']");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 120;

        if(window.scrollY >= sectionTop){

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("text-blue-600");

        if(link.getAttribute("href") === "#" + current){

            link.classList.add("text-blue-600");

        }

    });

});

