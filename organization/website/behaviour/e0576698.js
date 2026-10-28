


    /* =====================================================
       ACCORDION
    ===================================================== */

    const accordionItems =
        document.querySelectorAll(".accordion-item");


    accordionItems.forEach(item => {


        const button =
            item.querySelector(".accordion-btn");


        button.addEventListener("click", () => {


            /* Close all other modules */

            accordionItems.forEach(otherItem => {

                if (otherItem !== item) {

                    otherItem.classList.remove("active");

                }

            });


            /* Toggle clicked module */

            item.classList.toggle("active");

        });

    });

