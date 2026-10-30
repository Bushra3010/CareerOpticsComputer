

function openModule(button) {

    const module = button.closest('.course-module');
    const lesson = module.querySelector('.lesson-box');
    const icon = module.querySelector('.module-icon');

    const isOpen = !lesson.classList.contains('hidden');


    // Close every module
    document.querySelectorAll('.course-module').forEach(function(item) {

        const box = item.querySelector('.lesson-box');
        const itemIcon = item.querySelector('.module-icon');

        box.classList.add('hidden');

        if (itemIcon) {
            itemIcon.textContent = '+';
        }

    });


    // Open selected module
    if (!isOpen) {

        lesson.classList.remove('hidden');

        if (icon) {
            icon.textContent = '−';
        }

    }

}


function openAllModules() {

    const modules = document.querySelectorAll('.course-module');

    let allOpen = true;


    modules.forEach(function(module) {

        const lesson = module.querySelector('.lesson-box');

        if (lesson.classList.contains('hidden')) {
            allOpen = false;
        }

    });


    modules.forEach(function(module) {

        const lesson = module.querySelector('.lesson-box');
        const icon = module.querySelector('.module-icon');


        if (allOpen) {

            lesson.classList.add('hidden');

            if (icon) {
                icon.textContent = '+';
            }

        } else {

            lesson.classList.remove('hidden');

            if (icon) {
                icon.textContent = '−';
            }

        }

    });

}

