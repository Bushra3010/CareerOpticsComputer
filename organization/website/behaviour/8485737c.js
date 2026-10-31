

/* MOBILE MENU */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});


/* CLOSE MOBILE MENU */

document.querySelectorAll("#mobileMenu a").forEach(link => {

    link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
    });

});


/* ACCORDION */

const accordionButtons =
document.querySelectorAll(".accordion-btn");

accordionButtons.forEach(button => {

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


/* FAQ */

document.querySelectorAll(".faq-btn").forEach(button => {

    button.addEventListener("click", () => {

        const content =
        button.nextElementSibling;

        const symbol =
        button.querySelector("span");

        document.querySelectorAll(".faq-content")
        .forEach(item => {

            if(item !== content){
                item.classList.add("hidden");
            }

        });

        document.querySelectorAll(".faq-btn span")
        .forEach(item => {

            if(item !== symbol){
                item.textContent = "+";
            }

        });

        content.classList.toggle("hidden");

        symbol.textContent =
        content.classList.contains("hidden") ? "+" : "−";

    });

});


/* WHATSAPP ADMISSION FORM */

document.getElementById("admissionForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    const name =
    document.getElementById("name").value;

    const phone =
    document.getElementById("phone").value;

    const email =
    document.getElementById("email").value;

    const education =
    document.getElementById("education").value;

    const mode =
    document.getElementById("mode").value;


    const message =
`Hello Career Optics Computer Academy,

I want to apply for the Digital Marketing Professional Course.

Name: ${name}
Mobile: ${phone}
Email: ${email}
Qualification: ${education}
Preferred Mode: ${mode}

Please share complete admission details.`;


    const whatsappURL =
    ("https://wa.me/" + (window.siteWhatsapp && window.siteWhatsapp() || "919999999999") + "?text=")
    + encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank"
    );

});


/* ACTIVE STICKY TAB */

const sections =
document.querySelectorAll("section[id]");

const tabs =
document.querySelectorAll(".tab");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop =
        section.offsetTop - 150;

        if(window.scrollY >= sectionTop){
            current = section.getAttribute("id");
        }

    });


    tabs.forEach(tab => {

        tab.classList.remove("tab-active");

        if(
            tab.getAttribute("href") === "#" + current
        ){
            tab.classList.add("tab-active");
        }

    });

});

