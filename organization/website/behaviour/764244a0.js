

    lucide.createIcons();


    /* Application Form */

    const form =
        document.getElementById("applyForm");

    const success =
        document.getElementById("successMessage");


    form.addEventListener("submit", function(e) {

        e.preventDefault();

        success.classList.remove("hidden");

        form.reset();

        success.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });


    /* Mobile Number Validation */

    document
        .querySelectorAll('input[type="tel"]')
        .forEach(function(input) {

            input.addEventListener(
                "input",
                function() {

                    this.value =
                        this.value.replace(/\D/g, "");

                }
            );

        });

