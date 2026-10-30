

    const form =
        document.getElementById("internshipForm");

    const success =
        document.getElementById("success");


    form.addEventListener("submit", function(e) {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();


        if (!name || !phone) {
            return;
        }


        success.classList.remove("hidden");

        form.reset();


        setTimeout(function() {

            success.classList.add("hidden");

        }, 5000);

    });

