

/* =========================================================
   MODULE ACCORDION
   ========================================================= */

function openModule(button){

    const module = button.closest('.course-module');

    const allModules = document.querySelectorAll('.course-module');

    allModules.forEach(function(item){

        if(item !== module){

            item.classList.remove('active');

        }

    });

    module.classList.toggle('active');

}


/* =========================================================
   OPEN ALL MODULES
   ========================================================= */

function openAllModules(){

    const allModules = document.querySelectorAll('.course-module');

    allModules.forEach(function(module){

        module.classList.add('active');

    });

}


/* =========================================================
   FAQ ACCORDION
   ========================================================= */

function toggleFaq(button){

    const faq = button.closest('.faq-item');

    const allFaqs = document.querySelectorAll('.faq-item');

    allFaqs.forEach(function(item){

        if(item !== faq){

            item.classList.remove('active');

        }

    });

    faq.classList.toggle('active');

}

