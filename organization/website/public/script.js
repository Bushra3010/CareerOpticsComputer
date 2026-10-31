document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     MOBILE NAVIGATION
  ===================================================== */

  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("mobileMenu");
  const icon = document.getElementById("menuIcon");

  function closeMobileMenu() {
    if (!menu || !icon) return;

    menu.classList.add("hidden");

    icon.classList.remove("fa-xmark");
    icon.classList.add("fa-bars");

    document
      .querySelectorAll(".mobile-submenu")
      .forEach(submenu => submenu.classList.remove("open"));

    document
      .querySelectorAll(".mobile-toggle")
      .forEach(button => button.classList.remove("open"));
  }

  if (menuBtn && menu && icon) {

    menuBtn.addEventListener("click", (event) => {

      event.stopPropagation();

      const isOpening = menu.classList.contains("hidden");

      menu.classList.toggle("hidden");

      if (isOpening) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

        document
          .querySelectorAll(".mobile-submenu")
          .forEach(submenu => submenu.classList.remove("open"));

        document
          .querySelectorAll(".mobile-toggle")
          .forEach(button => button.classList.remove("open"));
      }

    });

  }


  /* =====================================================
     MOBILE DROPDOWN / SUBMENU
  ===================================================== */

  const mobileToggles = document.querySelectorAll(".mobile-toggle");

  mobileToggles.forEach(button => {

    button.addEventListener("click", (event) => {

      event.preventDefault();
      event.stopPropagation();

      const submenu = button.nextElementSibling;

      if (!submenu) return;

      const isCurrentlyOpen = submenu.classList.contains("open");

      // Close all other submenus
      document
        .querySelectorAll(".mobile-submenu")
        .forEach(item => {
          item.classList.remove("open");
        });

      document
        .querySelectorAll(".mobile-toggle")
        .forEach(item => {
          item.classList.remove("open");
        });

      // Open selected submenu
      if (!isCurrentlyOpen) {

        submenu.classList.add("open");
        button.classList.add("open");

      }

    });

  });


  /* =====================================================
     CLOSE MOBILE MENU WHEN LINK IS CLICKED
  ===================================================== */

  document
    .querySelectorAll("#mobileMenu a")
    .forEach(link => {

      link.addEventListener("click", () => {

        closeMobileMenu();

      });

    });


  /* =====================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ===================================================== */

  document.addEventListener("click", (event) => {

    if (!menuBtn || !menu) return;

    const clickedInsideMenu = menu.contains(event.target);
    const clickedMenuButton = menuBtn.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuButton) {

      closeMobileMenu();

    }

  });


  /* =====================================================
     ESC KEY CLOSE MENU
  ===================================================== */

  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

      closeMobileMenu();

    }

  });


  /* =====================================================
     CLOSE MOBILE MENU ON DESKTOP
  ===================================================== */

  window.addEventListener("resize", () => {

    if (window.innerWidth >= 1024) {

      closeMobileMenu();

    }

  });


  /* =====================================================
     SMOOTH SCROLLING
  ===================================================== */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {

      link.addEventListener("click", (event) => {

        const targetId = link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#" ||
          targetId.length < 2
        ) {
          return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        const isMobile = window.innerWidth < 768;

        const offset = isMobile ? 75 : 110;

        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          offset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

      });

    });


  /* =====================================================
     ACTIVE NAVBAR LINK ON SCROLL
  ===================================================== */

  const sections = document.querySelectorAll("section[id]");

  const desktopLinks = document.querySelectorAll(
    "nav .nav-link[href^='#']"
  );

  function updateActiveNav() {

    let currentSection = "";

    sections.forEach(section => {

      const sectionTop =
        section.offsetTop - 150;

      const sectionHeight =
        section.offsetHeight;

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {

        currentSection = section.getAttribute("id");

      }

    });

    desktopLinks.forEach(link => {

      link.classList.remove("active");

      const href =
        link.getAttribute("href");

      if (href === `#${currentSection}`) {

        link.classList.add("active");

      }

    });

  }

  window.addEventListener(
    "scroll",
    updateActiveNav
  );

  updateActiveNav();


  /* =====================================================
     NAVBAR SCROLL EFFECT
  ===================================================== */

  const header =
    document.getElementById("siteHeader");

  function updateHeader() {

    if (!header) return;

    if (window.scrollY > 20) {

      header.classList.add("scrolled");

    } else {

      header.classList.remove("scrolled");

    }

  }

  window.addEventListener(
    "scroll",
    updateHeader
  );

  updateHeader();


  /* =====================================================
     ENQUIRY FORM
  ===================================================== */

  const form =
    document.getElementById("enquiryForm");

  const formMessage =
    document.getElementById("formMessage");

  if (form) {

    form.addEventListener("submit", (event) => {

      event.preventDefault();

      const formData =
        new FormData(form);

      const name =
        formData.get("name") || "Student";

      const phone =
        formData.get("phone") || "";

      const course =
        formData.get("course") || "";

      // Basic phone validation
      if (phone.length < 10) {

        if (formMessage) {

          formMessage.textContent =
            "Please enter a valid mobile number.";

          formMessage.classList.remove("hidden");

          formMessage.classList.remove(
            "bg-emerald-50",
            "text-emerald-700"
          );

          formMessage.classList.add(
            "bg-red-50",
            "text-red-700"
          );

        }

        return;

      }

      if (formMessage) {

        formMessage.textContent =
          `Thank you, ${name}! Your enquiry for ${course} has been submitted successfully.`;

        formMessage.classList.remove("hidden");

        formMessage.classList.remove(
          "bg-red-50",
          "text-red-700"
        );

        formMessage.classList.add(
          "bg-emerald-50",
          "text-emerald-700"
        );

      }

      // Clear form
      form.reset();

    });

  }


  /* =====================================================
     COURSE CARD HOVER
  ===================================================== */

  const courseCards =
    document.querySelectorAll(".course-card");

  courseCards.forEach(card => {

    card.addEventListener("mouseenter", () => {

      card.style.transform =
        "translateY(-6px)";

    });

    card.addEventListener("mouseleave", () => {

      card.style.transform =
        "";

    });

  });


  /* =====================================================
     MOBILE SUBMENU AUTO CLOSE AFTER LINK CLICK
  ===================================================== */

  document
    .querySelectorAll(".mobile-submenu a")
    .forEach(link => {

      link.addEventListener("click", () => {

        document
          .querySelectorAll(".mobile-submenu")
          .forEach(submenu => {

            submenu.classList.remove("open");

          });

        document
          .querySelectorAll(".mobile-toggle")
          .forEach(button => {

            button.classList.remove("open");

          });

      });

    });


  /* =====================================================
     PREVENT EMPTY # LINKS FROM JUMPING
  ===================================================== */

  document
    .querySelectorAll('a[href="#"]')
    .forEach(link => {

      link.addEventListener("click", (event) => {

        event.preventDefault();

      });

    });


  /* =====================================================
     SCROLL REVEAL ANIMATION
  ===================================================== */

  const revealElements = document.querySelectorAll(
    ".feature-card, .course-card, .career-card, .tool-card, .student-card"
  );

  if ("IntersectionObserver" in window) {

    const observer =
      new IntersectionObserver(
        (entries, observerInstance) => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "reveal-show"
              );

              observerInstance.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold: 0.12
        }
      );

    revealElements.forEach(element => {

      element.classList.add(
        "reveal-hidden"
      );

      observer.observe(element);

    });

  }


  /* =====================================================
     DROPDOWN KEYBOARD SUPPORT
  ===================================================== */

  const dropdownButtons =
    document.querySelectorAll(
      ".nav-dropdown-toggle"
    );

  dropdownButtons.forEach(button => {

    button.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          const parent =
            button.closest(".nav-dropdown");

          if (!parent) return;

          const panel =
            parent.querySelector(
              ".dropdown-panel"
            );

          if (!panel) return;

          const isOpen =
            panel.classList.contains(
              "keyboard-open"
            );

          document
            .querySelectorAll(
              ".dropdown-panel"
            )
            .forEach(item => {

              item.classList.remove(
                "keyboard-open"
              );

            });

          if (!isOpen) {

            panel.classList.add(
              "keyboard-open"
            );

          }

        }

      }
    );

  });


  /* =====================================================
     AUTO CLOSE KEYBOARD DROPDOWNS
  ===================================================== */

  document.addEventListener("click", event => {

    if (
      !event.target.closest(
        ".nav-dropdown"
      )
    ) {

      document
        .querySelectorAll(
          ".dropdown-panel"
        )
        .forEach(panel => {

          panel.classList.remove(
            "keyboard-open"
          );

        });

    }

  });


  /* =====================================================
     CONSOLE STATUS
  ===================================================== */

  console.log(
    "%c Career Optics Computer Academy UI Loaded Successfully ",
    "background:#2563eb;color:#fff;padding:8px 12px;border-radius:8px;font-weight:bold;"
  );

});