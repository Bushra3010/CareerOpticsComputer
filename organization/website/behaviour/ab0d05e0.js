

    lucide.createIcons();


    const form =
        document.getElementById("internshipForm");

    const success =
        document.getElementById("success");


    if (form) {

        form.addEventListener("submit", function (e) {

            e.preventDefault();

            if (success) {

                success.classList.remove("hidden");

                success.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                setTimeout(function () {

                    success.classList.add("hidden");

                }, 5000);

            }

            form.reset();

        });

    }


    document
        .querySelectorAll('input[type="tel"]')
        .forEach(function (input) {

            input.addEventListener("input", function () {

                this.value =
                    this.value.replace(/\D/g, "");

            });

        });

