

/* MOBILE MENU */

function toggleMobile(){

    const menu =
        document.getElementById("mobileMenu");

    menu.classList.toggle("hidden");

}


/* ACCORDION */

function toggleAccordion(button){

    const current =
        button.parentElement;

    const all =
        document.querySelectorAll(".accordion");


    all.forEach(item => {

        if(item !== current){

            item.classList.remove("open");

            const arrow =
                item.querySelector(".arrow");

            if(arrow){
                arrow.textContent = "+";
            }

        }

    });


    current.classList.toggle("open");


    const arrow =
        button.querySelector(".arrow");


    if(arrow){

        arrow.textContent =
            current.classList.contains("open")
            ? "−"
            : "+";

    }

}


/* FAQ */

function toggleFAQ(button){

    const current =
        button.parentElement;

    const all =
        document.querySelectorAll(".faq-item");


    all.forEach(item => {

        if(item !== current){

            item.classList.remove("active");

            const span =
                item.querySelector("button span");

            if(span){
                span.textContent = "+";
            }

        }

    });


    current.classList.toggle("active");


    const span =
        button.querySelector("span");


    if(span){

        span.textContent =
            current.classList.contains("active")
            ? "−"
            : "+";

    }

}


/* ADMISSION FORM → WHATSAPP */

function submitAdmission(event){

    event.preventDefault();


    const name =
        document.getElementById("studentName").value;

    const phone =
        document.getElementById("studentPhone").value;

    const email =
        document.getElementById("studentEmail").value;

    const qualification =
        document.getElementById("qualification").value;

    const interested =
        document.getElementById("interested").value;

    const mode =
        document.getElementById("mode").value;

    const message =
        document.getElementById("studentMessage").value;


    const whatsappText =

        `Hello Career Optics Computer Academy,

I want to enroll in Website Designing Course.

Name: ${name}
Mobile: ${phone}
Email: ${email}
Qualification: ${qualification}
Interested Course: ${interested}
Preferred Mode: ${mode}
Message: ${message}

Course Fee: ₹12,500`;


    const whatsappURL =
        ("https://wa.me/" + (window.siteWhatsapp && window.siteWhatsapp() || "919999999999") + "?text=")
        + encodeURIComponent(whatsappText);


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* MOBILE MENU CLOSE */

document
.querySelectorAll("#mobileMenu a")
.forEach(link => {

    link.addEventListener("click",function(){

        document
        .getElementById("mobileMenu")
        .classList.add("hidden");

    });

});

