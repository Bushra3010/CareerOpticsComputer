

function openModule(number) {

    const box = document.getElementById("module-" + number);
    const arrow = document.getElementById("arrow-" + number);

    if (box.classList.contains("active")) {

        box.classList.remove("active");
        arrow.classList.remove("rotate");

    } else {

        box.classList.add("active");
        arrow.classList.add("rotate");

    }

}


function openAllModules() {

    for (let i = 1; i <= 12; i++) {

        const box = document.getElementById("module-" + i);
        const arrow = document.getElementById("arrow-" + i);

        if (box) {
            box.classList.add("active");
        }

        if (arrow) {
            arrow.classList.add("rotate");
        }

    }

}

