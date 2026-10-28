

/* MOBILE MENU */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});


/* CLOSE MOBILE MENU AFTER CLICK */

document.querySelectorAll("#mobileMenu a").forEach(link => {

    link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
    });

});


/* ACCORDION */

const accordions = document.querySelectorAll("#syllabus details");

accordions.forEach(item => {

    item.addEventListener("toggle", () => {

        if(item.open){

            accordions.forEach(other => {

                if(other !== item){
                    other.removeAttribute("open");
                }

            });

        }

    });

});


/* FAQ ACCORDION */

const faqs = document.querySelectorAll("#faq details");

faqs.forEach(item => {

    item.addEventListener("toggle", () => {

        if(item.open){

            faqs.forEach(other => {

                if(other !== item){
                    other.removeAttribute("open");
                }

            });

        }

    });

});


/* WHATSAPP ADMISSION FORM */

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

`*Java Development Course Admission Enquiry*

*Student Name:* ${name}

*Mobile:* ${mobile}

*Email:* ${email}

*Qualification:* ${qualification}

*Course:* ${course}

*Preferred Mode:* ${mode}

*Message:* ${message || "No message"}

I want to take admission in the Java Development Course at Career Optics Computer Centre.`;


    const whatsappNumber = (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");

    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(whatsappMessage);


    window.open(url, "_blank");

});


/* COURSE TABS */

const tabs = document.querySelectorAll(".course-tab");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => {
            t.classList.remove("active");
        });

        tab.classList.add("active");

    });

});

