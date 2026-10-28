

/* =========================================
   SEMESTER TOGGLE
========================================= */

function toggleSemester(id){

    const content =
        document.getElementById(id);

    const arrow =
        document.getElementById("arrow-" + id);

    if(!content) return;

    content.classList.toggle("open");

    if(arrow){
        arrow.classList.toggle("rotate");
    }

}


/* =========================================
   SUBJECT TOGGLE
========================================= */

function toggleSubject(id){

    const content =
        document.getElementById(id);

    const arrow =
        document.getElementById("arrow-" + id);

    if(!content) return;

    content.classList.toggle("open");

    if(arrow){
        arrow.classList.toggle("rotate");
    }

}


/* =========================================
   OPEN ALL SEMESTERS
========================================= */

function openAllSemesters(){

    const semesters =
        document.querySelectorAll(".sem-content");

    const arrows =
        document.querySelectorAll('[id^="arrow-sem"]');

    semesters.forEach(function(item){

        item.classList.add("open");

    });

    arrows.forEach(function(item){

        item.classList.add("rotate");

    });

}


/* =========================================
   CLOSE ALL SEMESTERS
========================================= */

function closeAllSemesters(){

    const semesters =
        document.querySelectorAll(".sem-content");

    const arrows =
        document.querySelectorAll('[id^="arrow-sem"]');

    semesters.forEach(function(item){

        item.classList.remove("open");

    });

    arrows.forEach(function(item){

        item.classList.remove("rotate");

    });

}


/* =========================================
   SMOOTH ANCHOR SCROLL
========================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(function(link){

    link.addEventListener(
        "click",
        function(e){

            const target =
                document.querySelector(
                    this.getAttribute("href")
                );

            if(target){

                e.preventDefault();

                target.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                });

            }

        }
    );

});

