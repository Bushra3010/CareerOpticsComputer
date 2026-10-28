

    /* Mobile Menu */

    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });


    /* Accordion */

    document.querySelectorAll(".accordion-btn").forEach(button => {

        button.addEventListener("click", () => {

            const item = button.closest(".accordion-item");

            document.querySelectorAll(".accordion-item").forEach(other => {

                if (other !== item) {
                    other.classList.remove("active");
                }

            });

            item.classList.toggle("active");

        });

    });


    /* FAQ */

    document.querySelectorAll(".faq-btn").forEach(button => {

        button.addEventListener("click", () => {

            const item = button.closest(".faq-item");
            const content = item.querySelector(".faq-content");
            const icon = item.querySelector(".faq-icon");

            document.querySelectorAll(".faq-item").forEach(other => {

                if (other !== item) {

                    other.querySelector(".faq-content").classList.add("hidden");

                    other.querySelector(".faq-icon").textContent = "+";

                }

            });

            content.classList.toggle("hidden");

            icon.textContent =
                content.classList.contains("hidden") ? "+" : "−";

        });

    });


    /* Admission Form -> WhatsApp */

    document.getElementById("admissionForm")
        .addEventListener("submit", function(e) {

            e.preventDefault();

            const name =
                document.getElementById("studentName").value;

            const mobile =
                document.getElementById("mobile").value;

            const email =
                document.getElementById("email").value;

            const qualification =
                document.getElementById("qualification").value;

            const mode =
                document.getElementById("mode").value;

            const message =
                document.getElementById("message").value;


            const whatsappMessage =

`*Node.js & Next.js Course Admission Enquiry*

*Student Name:* ${name}

*Mobile:* ${mobile}

*Email:* ${email}

*Qualification:* ${qualification}

*Preferred Mode:* ${mode}

*Message:* ${message}

*Course:* Node.js & Next.js Development

*Career Optics Computer Centre*`;


            const whatsappNumber = (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");

            const url =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(whatsappMessage);


            window.open(url, "_blank");

        });


    /* Course Tabs */

    const sections = document.querySelectorAll(
        "#overview, #syllabus, #projects, #career, #admission, #faq"
    );

    const tabs = document.querySelectorAll(".tab");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 180;

            if (window.scrollY >= top) {
                current = section.getAttribute("id");
            }

        });


        tabs.forEach(tab => {

            tab.classList.remove("tab-active");

            if (tab.getAttribute("href") === "#" + current) {
                tab.classList.add("tab-active");
            }

        });

    });

