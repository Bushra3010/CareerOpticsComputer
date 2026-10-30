

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


/* MODULE ACCORDION */

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


/* OPEN ALL */

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


/* WHATSAPP FORM */

function sendWhatsApp(event){

    event.preventDefault();

    const name =
        document.getElementById("studentName").value;

    const mobile =
        document.getElementById("studentMobile").value;

    const qualification =
        document.getElementById("qualification").value;

    const batch =
        document.getElementById("preferredBatch").value;


    const message =
`*Google Suite Course - Admission Enquiry*

Student Name: ${name}

Mobile Number: ${mobile}

Qualification: ${qualification}

Preferred Batch: ${batch}

Course: Google Suite

I want to join the Google Suite course at Career Optics Computer Centre.`;


    /* CHANGE WHATSAPP NUMBER */

    const whatsappNumber =
        (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");


    const whatsappURL =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* CLOSE MOBILE MENU ON SCROLL */

window.addEventListener("scroll", function(){

    const menu =
        document.getElementById("mobileMenu");

    if(menu){
        menu.classList.remove("show");
    }

});

