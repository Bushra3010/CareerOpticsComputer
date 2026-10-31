

/* MOBILE MENU */
document.getElementById("menuBtn").addEventListener("click",function(){

    document.getElementById("mobileMenu")
    .classList.toggle("hidden");

});


/* ACCORDION */

function toggleAccordion(button){

    const item = button.parentElement;

    document.querySelectorAll(".accordion-item").forEach(function(el){

        if(el !== item){
            el.classList.remove("active");
        }

    });

    item.classList.toggle("active");
}


/* FAQ */

function toggleFAQ(button){

    const current = button.parentElement;
    const answer = current.querySelector(".faq-answer");

    document.querySelectorAll(".faq-item").forEach(function(item){

        if(item !== current){

            item.querySelector(".faq-answer")
                .classList.add("hidden");

            item.querySelector(".faq-icon")
                .textContent = "+";
        }

    });

    answer.classList.toggle("hidden");

    const icon = current.querySelector(".faq-icon");

    icon.textContent = answer.classList.contains("hidden")
        ? "+"
        : "−";
}


/* TABS */

function goTo(section,button){

    document.querySelectorAll(".tab")
        .forEach(function(tab){
            tab.classList.remove("active");
        });

    button.classList.add("active");

    document.getElementById(section)
        .scrollIntoView({
            behavior:"smooth",
            block:"start"
        });
}


/* ADMISSION -> WHATSAPP */

document.getElementById("admissionForm")
.addEventListener("submit",function(e){

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
`*Career Optics Computer Academy Admission Enquiry*

*Course:* ${course}

*Student Name:* ${name}

*Mobile:* ${mobile}

*Email:* ${email}

*Qualification:* ${qualification}

*Preferred Mode:* ${mode}

*Message:* ${message}`;


    const whatsappURL =
        ("https://wa.me/" + (window.siteWhatsapp && window.siteWhatsapp() || "919999999999") + "?text=")
        + encodeURIComponent(whatsappMessage);


    window.open(whatsappURL,"_blank");

});

