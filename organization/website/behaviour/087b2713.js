


/* MOBILE MENU */

const menuBtn =
document.getElementById("menuBtn");

const mobileMenu =
document.getElementById("mobileMenu");


menuBtn.addEventListener("click", () => {

mobileMenu.classList.toggle("hidden");

});



/* ACCORDION */

document.querySelectorAll(".accordion-btn")
.forEach(button => {

button.addEventListener("click", () => {

const current =
button.parentElement;


document.querySelectorAll(".accordion-item")
.forEach(item => {

if(item !== current){

item.classList.remove("active");

}

});


current.classList.toggle("active");

});

});



/* FAQ */

document.querySelectorAll(".faq-btn")
.forEach(button => {

button.addEventListener("click", () => {

const faq =
button.parentElement;

const content =
faq.querySelector(".faq-content");


document.querySelectorAll(".faq")
.forEach(item => {

if(item !== faq){

item.querySelector(".faq-content")
.classList.add("hidden");

item.querySelector(".faq-btn span")
.textContent = "+";

}

});


content.classList.toggle("hidden");


button.querySelector("span").textContent =
content.classList.contains("hidden")
? "+"
: "−";

});

});



/* WHATSAPP FORM */

document
.getElementById("admissionForm")
.addEventListener("submit", function(e){

e.preventDefault();


const name =
document.getElementById("name").value;

const mobile =
document.getElementById("mobile").value;

const email =
document.getElementById("email").value;

const qualification =
document.getElementById("qualification").value;

const mode =
document.getElementById("mode").value;


const message =
`Hello Career Optics Computer Centre,

I want to enquire about the Video Editor Professional Course.

Name: ${name}
Mobile: ${mobile}
Email: ${email}
Qualification: ${qualification}
Preferred Mode: ${mode}

Please share complete course and admission details.`;


const whatsapp =
("https://wa.me/" + (window.siteWhatsapp && window.siteWhatsapp() || "919999999999") + "?text=")
+
encodeURIComponent(message);


window.open(whatsapp, "_blank");

});



/* CLOSE MOBILE MENU */

document.querySelectorAll("#mobileMenu a")
.forEach(link => {

link.addEventListener("click", () => {

mobileMenu.classList.add("hidden");

});

});

