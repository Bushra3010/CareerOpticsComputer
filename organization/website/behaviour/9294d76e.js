

    /* Lucide */

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }


    /* Mobile Menu */

    function toggleMenu() {

        const menu =
            document.getElementById("mobileMenu");

        menu.classList.toggle("hidden");

    }


    /* Admission Form */

    function submitForm(event) {

        event.preventDefault();

        alert(
            "Thank you! Your Accounting & Taxation course enquiry has been submitted."
        );

    }

