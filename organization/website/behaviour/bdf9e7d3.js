

/* Mobile Menu */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("hidden");

});


/* Close Mobile Menu After Click */
document.querySelectorAll("#mobileMenu a").forEach(link => {

    link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
    });

});


/* Module App Navigation */
document.querySelectorAll(".module-btn").forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.module;

        document.querySelectorAll(".module-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        document.querySelectorAll(".module-content").forEach(content => {
            content.classList.remove("active");
        });

        button.classList.add("active");

        const selectedModule = document.getElementById(target);

        if(selectedModule){
            selectedModule.classList.add("active");
        }

    });

});


/* Admission Form */
const admissionForm = document.getElementById("admissionForm");
const successMessage = document.getElementById("successMessage");

admissionForm.addEventListener("submit", function(e){

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();

    if(name === "" || mobile === ""){

        alert("Please enter your name and mobile number.");

        return;
    }

    successMessage.classList.remove("hidden");

    admissionForm.reset();

});


/* Smooth Anchor Handling */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function(e){

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            e.preventDefault();

            target.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });

        }

    });

});

