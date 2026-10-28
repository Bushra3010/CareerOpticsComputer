
    /* =====================================================
   WHATSAPP CHATBOT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById("whatsappButton");

    const panel =
        document.getElementById("whatsappPanel");

    const close =
        document.getElementById("closeWhatsapp");

    const departments =
        document.querySelectorAll(".wa-department");


    /* OPEN / CLOSE */

    button?.addEventListener("click", (e) => {

        e.stopPropagation();

        panel.classList.toggle("hidden");

    });


    /* CLOSE */

    close?.addEventListener("click", (e) => {

        e.stopPropagation();

        panel.classList.add("hidden");

    });


    /* DEPARTMENT */

    departments.forEach((department) => {

        department.addEventListener("click", () => {

            const number =
                department.dataset.number;

            const message =
                department.dataset.message ||
                "Hello, I need some information.";


            if (!number) return;


            const url =
                `https://wa.me/${number}?text=${
                    encodeURIComponent(message)
                }`;


            window.open(url, "_blank");


            panel.classList.add("hidden");

        });

    });


    /* OUTSIDE CLICK */

    document.addEventListener("click", (e) => {

        const widget =
            document.getElementById(
                "whatsappWidget"
            );

        if (
            widget &&
            !widget.contains(e.target)
        ) {

            panel.classList.add("hidden");

        }

    });


    /* ESC */

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            panel.classList.add("hidden");

        }

    });

});

    /* =========================================
       LUCIDE ICONS
    ========================================= */

    lucide.createIcons();


    /* =========================================
       MOBILE MENU
    ========================================= */

    const mobileBtn =
        document.getElementById("mobileBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");


    mobileBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("hidden");

    });


    /* Close Mobile Menu */

    document
        .querySelectorAll("#mobileMenu a")
        .forEach(link => {

            link.addEventListener("click", () => {

                mobileMenu.classList.add("hidden");

            });

        });


    /* =========================================
       CONTACT FORM
    ========================================= */

    document
        .getElementById("contactForm")
        .addEventListener("submit", function(e) {

            e.preventDefault();

            alert(
                "Thank you! Your enquiry has been submitted."
            );

            this.reset();

        });


    /* =========================================
       SCROLL REVEAL
    ========================================= */

    const revealElements =
        document.querySelectorAll(
            "section:not(#home)"
        );


    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.style.opacity = "1";

                        entry.target.style.transform =
                            "translateY(0)";

                    }

                });

            },
            {
                threshold: .12
            }
        );


    revealElements.forEach(section => {

        section.style.opacity = "0";

        section.style.transform =
            "translateY(30px)";

        section.style.transition =
            "opacity .8s ease, transform .8s ease";

        revealObserver.observe(section);

    });


    /* =========================================
       ACTIVE NAV ON SCROLL
    ========================================= */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            ".desktop-nav a"
        );


    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 150;

            if (
                window.scrollY >= sectionTop
            ) {

                current =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove(
                "text-[#090c9f]"
            );

            if (
                link.getAttribute("href") ===
                "#" + current
            ) {

                link.classList.add(
                    "text-[#090c9f]"
                );

            }

        });

    });


    /* =========================================
       PREVENT IMAGE DRAG
    ========================================= */

    document
        .querySelectorAll("img")
        .forEach(img => {

            img.addEventListener(
                "dragstart",
                e => e.preventDefault()
            );

        });
document.addEventListener("DOMContentLoaded", function () {

  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuIcon = document.getElementById("menuIcon");

  /* =====================================
     MOBILE MENU OPEN / CLOSE
  ===================================== */

  menuBtn.addEventListener("click", function (e) {

    e.stopPropagation();

    const isOpen = mobileMenu.classList.contains("show");

    if (isOpen) {

      closeMobileMenu();

    } else {

      openMobileMenu();

    }

  });


  function openMobileMenu() {

    mobileMenu.classList.add("show");

    menuBtn.setAttribute("aria-expanded", "true");

    menuBtn.setAttribute("aria-label", "Close menu");

    menuIcon.classList.remove("fa-bars");

    menuIcon.classList.add("fa-xmark");

  }


  function closeMobileMenu() {

    mobileMenu.classList.remove("show");

    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.setAttribute("aria-label", "Open menu");

    menuIcon.classList.remove("fa-xmark");

    menuIcon.classList.add("fa-bars");

    closeMobileDropdowns();

  }


  /* =====================================
     MOBILE DROPDOWNS
  ===================================== */

  const mobileGroups =
    document.querySelectorAll(".mobile-group");


  mobileGroups.forEach(function (group) {

    const toggle =
      group.querySelector(".mobile-toggle");


    toggle.addEventListener("click", function (e) {

      e.stopPropagation();

      const isOpen =
        group.classList.contains("open");


      /* Close all other dropdowns */

      mobileGroups.forEach(function (otherGroup) {

        if (otherGroup !== group) {

          otherGroup.classList.remove("open");

          const otherToggle =
            otherGroup.querySelector(".mobile-toggle");

          otherToggle.classList.remove("active");

        }

      });


      /* Toggle current */

      if (isOpen) {

        group.classList.remove("open");

        toggle.classList.remove("active");

      } else {

        group.classList.add("open");

        toggle.classList.add("active");

      }

    });

  });


  function closeMobileDropdowns() {

    mobileGroups.forEach(function (group) {

      group.classList.remove("open");

      const toggle =
        group.querySelector(".mobile-toggle");

      toggle.classList.remove("active");

    });

  }


  /* =====================================
     MOBILE LINK CLICK
  ===================================== */

  const mobileLinks =
    document.querySelectorAll(
      ".mobile-link, .mobile-submenu a, .mobile-outline, .mobile-solid"
    );


  mobileLinks.forEach(function (link) {

    link.addEventListener("click", function () {

      closeMobileMenu();

    });

  });


  /* =====================================
     DESKTOP DROPDOWNS
  ===================================== */

  const desktopDropdowns =
    document.querySelectorAll(".nav-dropdown");


  desktopDropdowns.forEach(function (dropdown) {

    const toggle =
      dropdown.querySelector(".nav-dropdown-toggle");


    toggle.addEventListener("click", function (e) {

      e.stopPropagation();


      const isOpen =
        dropdown.classList.contains("open");


      /* Close all */

      desktopDropdowns.forEach(function (item) {

        item.classList.remove("open");

      });


      /* Open current */

      if (!isOpen) {

        dropdown.classList.add("open");

      }

    });

  });


  /* =====================================
     OUTSIDE CLICK
  ===================================== */

  document.addEventListener("click", function (e) {

    /* Desktop dropdown */

    if (!e.target.closest(".nav-dropdown")) {

      desktopDropdowns.forEach(function (dropdown) {

        dropdown.classList.remove("open");

      });

    }


    /* Mobile menu */

    if (
      !e.target.closest("#mobileMenu") &&
      !e.target.closest("#menuBtn")
    ) {

      closeMobileMenu();

    }

  });


  /* =====================================
     ESC KEY
  ===================================== */

  document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

      closeMobileMenu();

      desktopDropdowns.forEach(function (dropdown) {

        dropdown.classList.remove("open");

      });

    }

  });


  /* =====================================
     WINDOW RESIZE
  ===================================== */

  window.addEventListener("resize", function () {

    if (window.innerWidth >= 1024) {

      closeMobileMenu();

    }

  });


  /* =====================================
     ACTIVE NAV LINK
  ===================================== */

  const allNavLinks =
    document.querySelectorAll(
      ".nav-link:not(.nav-dropdown-toggle)"
    );


  allNavLinks.forEach(function (link) {

    link.addEventListener("click", function () {

      allNavLinks.forEach(function (item) {

        item.classList.remove("active");

      });

      this.classList.add("active");

    });

  });


});
