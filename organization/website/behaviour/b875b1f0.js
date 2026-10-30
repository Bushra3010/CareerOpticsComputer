


/* -----------------------------------------
   MAIN DROPDOWN
----------------------------------------- */

function toggleDrop(id){

    const content =
        document.getElementById(id);

    const arrow =
        document.getElementById("arrow-" + id);

    if(!content) return;

    content.classList.toggle("show");

    if(arrow){

        arrow.classList.toggle("rotate");

    }

}



/* -----------------------------------------
   CHAPTER DROPDOWN
----------------------------------------- */

function chapter(id){

    const content =
        document.getElementById(id);

    if(!content) return;

    content.classList.toggle("show");

}



/* -----------------------------------------
   EXPAND / COLLAPSE CLASS
----------------------------------------- */

function toggleSection(sectionId){

    const section =
        document.getElementById(sectionId);

    if(!section) return;

    const dropdowns =
        section.querySelectorAll(".drop-content");

    let open = false;

    dropdowns.forEach(function(drop){

        if(!drop.classList.contains("show")){

            open = true;

        }

    });


    dropdowns.forEach(function(drop){

        if(open){

            drop.classList.add("show");

        }else{

            drop.classList.remove("show");

        }

    });

}



/* -----------------------------------------
   SMOOTH NAVIGATION
----------------------------------------- */

document.querySelectorAll('a[href^="#"]')
.forEach(function(link){

    link.addEventListener("click",function(e){

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

    });

});


