

lucide.createIcons();


const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");


menuBtn.addEventListener("click", function () {

    mobileMenu.classList.toggle("hidden");

    if (mobileMenu.classList.contains("hidden")) {

        menuBtn.innerHTML =
        '<i data-lucide="menu" class="h-6 w-6"></i>';

    } else {

        menuBtn.innerHTML =
        '<i data-lucide="x" class="h-6 w-6"></i>';

    }

    lucide.createIcons();

});


document.querySelectorAll("#mobileMenu a").forEach(function(link) {

    link.addEventListener("click", function() {

        mobileMenu.classList.add("hidden");

        menuBtn.innerHTML =
        '<i data-lucide="menu" class="h-6 w-6"></i>';

        lucide.createIcons();

    });

});


document.querySelector("form").addEventListener("submit", function(e) {

    e.preventDefault();

    alert("Thank you! Your admission enquiry has been submitted.");

});

