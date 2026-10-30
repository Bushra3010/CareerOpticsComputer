

function openModule(num) {

    const content = document.getElementById("module" + num);
    const icon = document.getElementById("icon" + num);

    if (!content) return;

    if (content.classList.contains("active")) {
        content.classList.remove("active");
        icon.textContent = "+";
    } else {
        content.classList.add("active");
        icon.textContent = "−";
    }
}


function openAllModules() {

    for (let i = 1; i <= 12; i++) {

        const content = document.getElementById("module" + i);
        const icon = document.getElementById("icon" + i);

        if (content) {
            content.classList.add("active");
        }

        if (icon) {
            icon.textContent = "−";
        }
    }
}


function closeAllModules() {

    for (let i = 1; i <= 12; i++) {

        const content = document.getElementById("module" + i);
        const icon = document.getElementById("icon" + i);

        if (content) {
            content.classList.remove("active");
        }

        if (icon) {
            icon.textContent = "+";
        }
    }
}


function toggleFaq(num) {

    const answer = document.getElementById("faq" + num);
    const icon = document.getElementById("faqIcon" + num);

    if (!answer) return;

    if (answer.classList.contains("active")) {

        answer.classList.remove("active");

        if (icon) {
            icon.textContent = "+";
        }

    } else {

        answer.classList.add("active");

        if (icon) {
            icon.textContent = "−";
        }
    }
}

