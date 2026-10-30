


/* MOBILE MENU */

function toggleMobile(){

    document
    .getElementById("mobileMenu")
    .classList.toggle("hidden");

}



/* COURSE ACCORDION */

function openModule(button){

    const module =
        button.closest(".module");

    const content =
        module.querySelector(".lesson-box");

    const arrow =
        module.querySelector(".lesson-arrow");


    document
    .querySelectorAll(".lesson-box")
    .forEach(item => {

        if(item !== content){

            item.classList.remove("show");

        }

    });


    document
    .querySelectorAll(".lesson-arrow")
    .forEach(item => {

        if(item !== arrow){

            item.classList.remove("rotate");

        }

    });


    content.classList.toggle("show");

    arrow.classList.toggle("rotate");

}



/* FAQ */

function faq(button){

    const answer =
        button.nextElementSibling;

    answer.classList.toggle("hidden");

}



/* WHATSAPP ADMISSION */

function sendWhatsApp(event){

    event.preventDefault();


    const name =
        document.getElementById("name").value;

    const mobile =
        document.getElementById("mobile").value;

    const qualification =
        document.getElementById("qualification").value;

    const batch =
        document.getElementById("batch").value;


    const message =

`*Back Office & Computer Operator Course - Admission Enquiry*

Student Name: ${name}

Mobile: ${mobile}

Qualification: ${qualification}

Preferred Batch: ${batch}

I want to join the Back Office & Computer Operator Course at Career Optics Computer Centre.`;


    /* CHANGE YOUR WHATSAPP NUMBER HERE */

    const whatsappNumber =
        (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");


    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(url,"_blank");

}

