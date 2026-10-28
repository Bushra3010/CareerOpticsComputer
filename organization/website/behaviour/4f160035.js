

function openModule(header) {

    const module = header.closest('.course-module');

    module.classList.toggle('active');

}


function openAllModules() {

    const modules =
        document.querySelectorAll('.course-module');

    modules.forEach(function(module) {

        module.classList.add('active');

    });

}

