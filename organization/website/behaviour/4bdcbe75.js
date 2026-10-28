

    lucide.createIcons();


    // Mobile Menu
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    menuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("hidden");

        const icon = menuBtn.querySelector("svg");

        if (mobileMenu.classList.contains("hidden")) {

            menuBtn.innerHTML =
                '<i data-lucide="menu" class="h-6 w-6"></i>';

        } else {

            menuBtn.innerHTML =
                '<i data-lucide="x" class="h-6 w-6"></i>';

        }

        lucide.createIcons();

    });


    // Close mobile menu after click
    document.querySelectorAll("#mobileMenu a").forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.add("hidden");

            menuBtn.innerHTML =
                '<i data-lucide="menu" class="h-6 w-6"></i>';

            lucide.createIcons();

        });

    });

