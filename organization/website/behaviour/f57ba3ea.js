

  /* Mobile Menu */
  const mobileBtn = document.getElementById("mobileBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  mobileBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });


  document.querySelectorAll(".mobile-link").forEach(link => {

    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
    });

  });


  /* Syllabus Accordion
     Only one module opens at a time
  */
  const accordionButtons =
    document.querySelectorAll(".accordion-btn");

  accordionButtons.forEach(button => {

    button.addEventListener("click", () => {

      const currentItem =
        button.closest(".accordion-item");

      document.querySelectorAll(".accordion-item").forEach(item => {

        if (item !== currentItem) {
          item.classList.remove("active");
        }

      });

      currentItem.classList.toggle("active");

    });

  });


  /* FAQ */
  document.querySelectorAll(".faq-btn").forEach(button => {

    button.addEventListener("click", () => {

      const item = button.closest(".faq-item");
      const content = item.querySelector(".faq-content");
      const icon = item.querySelector(".faq-icon");

      const isOpen =
        !content.classList.contains("hidden");

      document.querySelectorAll(".faq-content").forEach(c => {
        c.classList.add("hidden");
      });

      document.querySelectorAll(".faq-icon").forEach(i => {
        i.textContent = "+";
      });

      if (!isOpen) {
        content.classList.remove("hidden");
        icon.textContent = "−";
      }

    });

  });


  /* WhatsApp Admission Form */
  document.getElementById("admissionForm")
    .addEventListener("submit", function(e) {

      e.preventDefault();

      const name =
        document.getElementById("name").value.trim();

      const mobile =
        document.getElementById("mobile").value.trim();

      const email =
        document.getElementById("email").value.trim();

      const qualification =
        document.getElementById("qualification").value;

      const course =
        document.getElementById("course").value;


      const message =
`Hello Career Optics Computer Academy,

I want to take admission in the Wedding Album & Video Editing course.

Name: ${name}
Mobile: ${mobile}
Email: ${email}
Qualification: ${qualification}
Course: ${course}

Please share course details, batch timing and admission process.`;


      const whatsappNumber = (window.siteWhatsapp && window.siteWhatsapp() || "919999999999");

      const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

      window.open(url, "_blank");

    });

