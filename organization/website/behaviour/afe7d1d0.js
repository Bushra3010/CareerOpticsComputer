

function openModule(button) {

    const currentModule = button.parentElement;

    const allModules = document.querySelectorAll('.course-module');

    allModules.forEach(function(module) {

        if (module !== currentModule) {
            module.classList.remove('active');
        }

    });

    currentModule.classList.toggle('active');
}


function openAllModules() {

    const allModules = document.querySelectorAll('.course-module');

    const allOpen = [...allModules].every(function(module) {
        return module.classList.contains('active');
    });

    allModules.forEach(function(module) {

        if (allOpen) {
            module.classList.remove('active');
        } else {
            module.classList.add('active');
        }

    });

}

