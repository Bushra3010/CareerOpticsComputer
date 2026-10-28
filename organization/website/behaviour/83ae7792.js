

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



/* ADMISSION WHATSAPP */

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


    const text =

    "Hello Career Optics Computer Centre,%0A%0A" +

    "I want to enroll in Diploma in Drawing & Painting.%0A%0A" +

    "Name: " +
    encodeURIComponent(name) +
    "%0A" +

    "Mobile: " +
    encodeURIComponent(phone) +
    "%0A" +

    "Email: " +
    encodeURIComponent(email) +
    "%0A" +

    "Qualification: " +
    encodeURIComponent(qualification) +
    "%0A" +

    "Interested In: " +
    encodeURIComponent(interested) +
    "%0A" +

    "Preferred Mode: " +
    encodeURIComponent(mode) +
    "%0A" +

    "Message: " +
    encodeURIComponent(message) +
    "%0A%0A" +

    "Course Fee: ₹8,500";


    const whatsapp =
    ("https://wa.me/" + (window.siteWhatsapp && window.siteWhatsapp() || "919999999999") + "?text=")
    + text;


    window.open(
        whatsapp,
        "_blank"
    );

}



/* CLOSE MOBILE MENU */

document
.querySelectorAll("#mobileMenu a")
.forEach(link => {

    link.addEventListener(
        "click",
        function(){

            document
            .getElementById("mobileMenu")
            .style.display = "none";

        }
    );

});



/* SMOOTH SCROLL */

document
.querySelectorAll('a[href^="#"]')
.forEach(link => {

    link.addEventListener(
        "click",
        function(event){

            const target =
            document.querySelector(
                this.getAttribute("href")
            );


            if(target){

                event.preventDefault();

                target.scrollIntoView({

                    behavior:"smooth",

                    block:"start"

                });

            }

        }
    );

});

