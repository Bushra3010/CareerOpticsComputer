

/* ================= MOBILE MENU ================= */

const mobileBtn =
    document.getElementById("mobileBtn");

const mobileMenu =
    document.getElementById("mobileMenu");

mobileBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("hidden");

});


/* ================= ACCORDION ================= */

document.querySelectorAll(".accordion-btn")
.forEach(button => {

    button.addEventListener("click", () => {

        const current =
            button.parentElement;

        document.querySelectorAll(".accordion-item")
        .forEach(item => {

            if(item !== current){
                item.classList.remove("active");
            }

        });

        current.classList.toggle("active");

    });

});


/* ================= FAQ ================= */

document.querySelectorAll(".faq-btn")
.forEach(button => {

    button.addEventListener("click", () => {

        const current =
            button.parentElement;

        const content =
            current.querySelector(".faq-content");

        document.querySelectorAll(".faq-content")
        .forEach(item => {

            if(item !== content){
                item.classList.add("hidden");
            }

        });

        content.classList.toggle("hidden");

    });

});


/* ================= WHATSAPP FORM ================= */

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
`*Career Optics Computer Centre Admission Enquiry*

*Course:* ${course}

*Student Name:* ${name}

*Mobile:* ${mobile}

*Email:* ${email}

*Qualification:* ${qualification}

*Preferred Mode:* ${mode}

*Message:* ${message}`;


    const url =
        ("https://wa.me/" + (window.siteWhatsapp && window.siteWhatsapp() || "919999999999") + "?text=")
        + encodeURIComponent(whatsappMessage);


    window.open(url, "_blank");

});


/* ================= MOBILE LINKS CLOSE MENU ================= */

document.querySelectorAll("#mobileMenu a")
.forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.add("hidden");

    });

});

