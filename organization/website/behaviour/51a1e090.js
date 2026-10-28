

/* Mobile Menu */

function toggleMobileMenu(){

    const menu = document.getElementById("mobileMenu");

    menu.classList.toggle("active");

}

function closeMobileMenu(){

    document.getElementById("mobileMenu")
        .classList.remove("active");

}


/* Syllabus Accordion */

function toggleAccordion(button){

    const item = button.parentElement;

    const content =
        item.querySelector(".accordion-content");

    const icon =
        button.querySelector(".rotate-icon");

    const allItems =
        document.querySelectorAll(".accordion-item");

    allItems.forEach(function(otherItem){

        if(otherItem !== item){

            const otherContent =
                otherItem.querySelector(".accordion-content");

            const otherIcon =
                otherItem.querySelector(".rotate-icon");

            if(otherContent){
                otherContent.classList.remove("active");
            }

            if(otherIcon){
                otherIcon.classList.remove("active");
            }

        }

    });


    content.classList.toggle("active");
    icon.classList.toggle("active");

}


/* FAQ Accordion */

function toggleFaq(button){

    const item = button.parentElement;

    const content =
        item.querySelector(".accordion-content");

    const icon =
        button.querySelector(".rotate-icon");

    const allItems =
        document.querySelectorAll(".faq-item");

    allItems.forEach(function(otherItem){

        if(otherItem !== item){

            const otherContent =
                otherItem.querySelector(".accordion-content");

            const otherIcon =
                otherItem.querySelector(".rotate-icon");

            otherContent.classList.remove("active");

            if(otherIcon){
                otherIcon.classList.remove("active");
            }

        }

    });


    content.classList.toggle("active");
    icon.classList.toggle("active");

}


/* Admission WhatsApp */

document.getElementById("admissionForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    const name =
        document.getElementById("studentName").value;

    const mobile =
        document.getElementById("mobile").value;

    const email =
        document.getElementById("email").value;

    const qualification =
        document.getElementById("qualification").value;

    const course =
        document.getElementById("course").value;

    const mode =
        document.getElementById("mode").value;

    const message =
        document.getElementById("message").value;


    const whatsappMessage =
`Hello Career Optics Computer Centre,

I want to apply for the Python Programming & Development Course.

Student Name: ${name}
Mobile: ${mobile}
Email: ${email}
Qualification: ${qualification}
Course: ${course}
Preferred Mode: ${mode}
Message: ${message}`;

    const whatsappNumber =
        (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");

    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(whatsappMessage);

    window.open(url, "_blank");

});

