

/* ================= MOBILE MENU ================= */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});


document.querySelectorAll("#mobileMenu a").forEach(link => {
    link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
    });
});


/* ================= ACCORDION ================= */

document.querySelectorAll(".accordion-btn").forEach(button => {

    button.addEventListener("click", () => {

        const current = button.parentElement;

        document.querySelectorAll(".accordion-item").forEach(item => {

            if(item !== current){
                item.classList.remove("active");
            }

        });

        current.classList.toggle("active");

    });

});


/* ================= FAQ ================= */

document.querySelectorAll(".faq-btn").forEach(button => {

    button.addEventListener("click", () => {

        const content = button.nextElementSibling;

        document.querySelectorAll(".faq-content").forEach(item => {

            if(item !== content){
                item.classList.add("hidden");
            }

        });

        content.classList.toggle("hidden");

    });

});


/* ================= WHATSAPP ADMISSION ================= */

document.getElementById("admissionForm").addEventListener("submit", function(e){

    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const education = document.getElementById("education").value;
    const mode = document.getElementById("mode").value;

    const message =
`Hello Career Optics Computer Centre,

I want to apply for the Social Media Marketing Course.

Name: ${name}
Mobile: ${phone}
Email: ${email}
Qualification: ${education}
Preferred Mode: ${mode}

Please share admission details, batch timing and enrollment process.`;

    const whatsappNumber = (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");

    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

    window.open(url, "_blank");

});


/* ================= STICKY TABS ================= */

const sections = document.querySelectorAll("section[id]");
const tabs = document.querySelectorAll(".tab-link");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 180;

        if(window.scrollY >= sectionTop){
            current = section.getAttribute("id");
        }

    });

    tabs.forEach(tab => {

        tab.classList.remove("tab-active");

        if(tab.getAttribute("href") === "#" + current){
            tab.classList.add("tab-active");
        }

    });

});

