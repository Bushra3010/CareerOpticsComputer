

function toggleMenu(){

    document
        .getElementById("mobileMenu")
        .classList.toggle("show");

}


function toggleAccordion(button){

    const current = button.parentElement;

    document.querySelectorAll(".accordion-item").forEach(item => {

        if(item !== current){
            item.classList.remove("active");
        }

    });

    current.classList.toggle("active");

}


function toggleFaq(button){

    const current = button.nextElementSibling;

    document.querySelectorAll(".faq-item > div").forEach(item => {

        if(item !== current){
            item.classList.add("hidden");
        }

    });

    current.classList.toggle("hidden");

}


function submitAdmission(event){

    event.preventDefault();

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

I want to take admission in the .NET Web Development Course.

Student Name: ${name}
Mobile: ${mobile}
Email: ${email}
Qualification: ${qualification}
Course: ${course}
Preferred Mode: ${mode}
Message: ${message}`;


    const whatsappNumber = (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");

    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(whatsappMessage);


    window.open(url, "_blank");

}

