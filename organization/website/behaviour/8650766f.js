

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


function chapter(id){

    const content =
        document.getElementById(id);

    if(!content) return;

    content.classList.toggle("show");

}


function toggleSection(sectionId){

    const section =
        document.getElementById(sectionId);

    if(!section) return;

    const dropdowns =
        section.querySelectorAll(".drop-content");

    let shouldOpen = false;

    dropdowns.forEach(drop => {

        if(!drop.classList.contains("show")){
            shouldOpen = true;
        }

    });

    dropdowns.forEach(drop => {

        if(shouldOpen){
            drop.classList.add("show");
        }else{
            drop.classList.remove("show");
        }

    });

}


document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function(e){

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

