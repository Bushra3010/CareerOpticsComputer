

/* =====================================================
   MOBILE MENU
===================================================== */

function toggleMobile(){

    const menu =
        document.getElementById("mobileMenu");

    if(menu.style.display === "block"){

        menu.style.display = "none";

    }else{

        menu.style.display = "block";

    }

}


/* =====================================================
   ACCORDION
===================================================== */

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


    if(
        current.classList.contains("open")
    ){

        arrow.textContent = "−";

    }else{

        arrow.textContent = "+";

    }

}


/* =====================================================
   FAQ
===================================================== */

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


    if(
        current.classList.contains("active")
    ){

        span.textContent = "−";

    }else{

        span.textContent = "+";

    }

}


/* =====================================================
   ADMISSION FORM → WHATSAPP
===================================================== */

function submitAdmission(event){

    event.preventDefault();


    const name =
        document.getElementById(
            "studentName"
        ).value;


    const phone =
        document.getElementById(
            "studentPhone"
        ).value;


    const message =
        "Hello Career Optics Computer Academy,%0A%0A" +

        "I want to enroll in AutoCAD 2D + 3D Course.%0A%0A" +

        "Name: "
        + encodeURIComponent(name)
        + "%0A" +

        "Mobile: "
        + encodeURIComponent(phone)
        + "%0A" +

        "Course Fee: ₹5,500";


    /*
       Replace 919999999999
       with your actual WhatsApp number.
    */

    const whatsapp =
        ("https://wa.me/" + (window.siteWhatsapp && window.siteWhatsapp() || "919999999999") + "?text=")
        + message;


    window.open(
        whatsapp,
        "_blank"
    );

}


/* =====================================================
   CLOSE MOBILE MENU AFTER CLICK
===================================================== */

document
.querySelectorAll('#mobileMenu a')
.forEach(link => {

    link.addEventListener(
        "click",
        function(){

            const menu =
                document.getElementById(
                    "mobileMenu"
                );

            menu.style.display = "none";

        }
    );

});


/* =====================================================
   SMOOTH SCROLL
===================================================== */

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

