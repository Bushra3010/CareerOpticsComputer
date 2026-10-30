

    lucide.createIcons();


    /* ===============================
       DESKTOP DROPDOWNS
    =============================== */

    const dropdowns =
        document.querySelectorAll(".desktop-dropdown");

    dropdowns.forEach(dropdown => {

        const button =
            dropdown.querySelector(".desktop-dropdown-btn");

        button.addEventListener("click", function(e) {

            e.stopPropagation();

            dropdowns.forEach(other => {

                if (other !== dropdown) {
                    other.classList.remove("open");
                }

            });

            dropdown.classList.toggle("open");

        });

    });


    document.addEventListener("click", function() {

        dropdowns.forEach(dropdown => {
            dropdown.classList.remove("open");
        });

    });


    /* ===============================
       MOBILE MENU
    =============================== */

    const mobileButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    mobileButton.addEventListener("click", function() {

        mobileMenu.classList.toggle("show");

    });


    /* ===============================
       MOBILE DROPDOWNS
    =============================== */

    document.querySelectorAll(".mobile-dropdown")
        .forEach(dropdown => {

            const button =
                dropdown.querySelector(".mobile-dropdown-btn");

            button.addEventListener("click", function() {

                document
                    .querySelectorAll(".mobile-dropdown")
                    .forEach(other => {

                        if (other !== dropdown) {
                            other.classList.remove("open");

                            const otherButton =
                                other.querySelector(
                                    ".mobile-dropdown-btn"
                                );

                            if (otherButton) {
                                otherButton.classList.remove("active");
                            }
                        }

                    });

                dropdown.classList.toggle("open");
                button.classList.toggle("active");

            });

        });


    /* ===============================
       CLOSE MOBILE MENU
    =============================== */

    document.querySelectorAll("#mobileMenu a")
        .forEach(link => {

            link.addEventListener("click", function() {

                mobileMenu.classList.remove("show");

            });

        });


    /* ===============================
       ESCAPE
    =============================== */

    document.addEventListener("keydown", function(e) {

        if (e.key === "Escape") {

            dropdowns.forEach(dropdown => {
                dropdown.classList.remove("open");
            });

            mobileMenu.classList.remove("show");

        }

    });

