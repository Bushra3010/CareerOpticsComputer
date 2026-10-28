

    /* LUCIDE */

    lucide.createIcons();


    /* MOBILE NUMBER */

    document
        .querySelectorAll('input[type="tel"]')
        .forEach(function(input) {

            input.addEventListener(
                "input",
                function() {

                    this.value =
                        this.value.replace(
                            /[^0-9]/g,
                            ""
                        );

                }
            );

        });


    /* FORM */

    const form =
        document.getElementById(
            "hireForm"
        );

    const success =
        document.getElementById(
            "success"
        );


    form.addEventListener(
        "submit",
        function(e) {

            e.preventDefault();

            success.classList.remove(
                "hidden"
            );

            success.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setTimeout(function() {

                form.reset();

            }, 800);

        }
    );

