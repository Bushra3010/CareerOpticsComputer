

lucide.createIcons();


function toggleMenu(){

    const menu =
    document.getElementById("mobileMenu");

    menu.classList.toggle("hidden");

}


function submitForm(event){

    event.preventDefault();

    alert(
        "Thank you! Your Website Developer Course enquiry has been submitted."
    );

}

