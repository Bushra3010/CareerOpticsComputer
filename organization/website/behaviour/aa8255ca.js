

/* ==========================================
   BOOK / MAIN DROPDOWN
========================================== */

function toggleDrop(id){

    const content = document.getElementById(id);
    const arrow = document.getElementById("arrow-" + id);

    if(!content) return;

    content.classList.toggle("show");

    if(arrow){
        arrow.classList.toggle("rotate");
    }
}


/* ==========================================
   CHAPTER DROPDOWN
========================================== */

function chapter(id){

    const content = document.getElementById(id);

    if(!content) return;

    content.classList.toggle("show");
}


/* ==========================================
   EXPAND / COLLAPSE ALL
========================================== */

function toggleSection(sectionId){

    const section = document.getElementById(sectionId);

    if(!section) return;

    const dropdowns =
        section.querySelectorAll(".drop-content");

    let open = false;

    dropdowns.forEach(item => {

        if(!item.classList.contains("show")){
            open = true;
        }

    });


    dropdowns.forEach(item => {

        if(open){
            item.classList.add("show");
        }else{
            item.classList.remove("show");
        }

    });

}


/* ==========================================
   MOBILE MENU / SMOOTH SCROLL
========================================== */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(e){

        const target =
            document.querySelector(this.getAttribute("href"));

        if(target){

            e.preventDefault();

            target.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });

        }

    });

});

