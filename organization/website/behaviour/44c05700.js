

/* ================================
   ACCORDION
================================ */

const accordionItems =
    document.querySelectorAll(".accordion-item");


accordionItems.forEach(item => {

    const button =
        item.querySelector(".accordion-btn");


    button.addEventListener("click", () => {

        accordionItems.forEach(otherItem => {

            if(otherItem !== item){

                otherItem.classList.remove("active");

            }

        });


        item.classList.toggle("active");

    });

});



