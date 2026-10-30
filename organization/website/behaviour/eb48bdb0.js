

lucide.createIcons();


/* MOBILE MENU */

function toggleMenu(){

const menu =
document.getElementById("mobileMenu");

menu.classList.toggle("hidden");

}


/* FAQ */

function toggleFaq(button){

const current =
button.parentElement;

document.querySelectorAll(".faq")
.forEach(function(item){

if(item !== current){
item.classList.remove("active");
}

});

current.classList.toggle("active");

}


/* FORM */

function submitForm(event){

event.preventDefault();

alert(
"Thank you! Your Railway admission enquiry has been submitted."
);

}


/* CLOSE MOBILE MENU ON DESKTOP */

window.addEventListener("resize",function(){

if(window.innerWidth >= 1024){

document
.getElementById("mobileMenu")
.classList.add("hidden");

}

});

