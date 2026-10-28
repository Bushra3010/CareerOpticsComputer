

    function openModule(button) {

        const module = button.closest('.course-module');

        if (!module) return;

        module.classList.toggle('active');

    }


    function openAllModules() {

        const modules = document.querySelectorAll('.course-module');

        const button = document.querySelector(
            '[onclick="openAllModules()"]'
        );

        /*
         * If any module is closed,
         * open all modules.
         *
         * If all modules are already open,
         * close all modules.
         */

        let hasClosedModule = false;

        modules.forEach(function(module) {

            if (!module.classList.contains('active')) {
                hasClosedModule = true;
            }

        });


        modules.forEach(function(module) {

            if (hasClosedModule) {

                module.classList.add('active');

            } else {

                module.classList.remove('active');

            }

        });


        if (button) {

            button.innerText = hasClosedModule
                ? 'Close All'
                : 'Open All';

        }

    }


    /*
     * Optional:
     * Open first module automatically.
     */

    document.addEventListener('DOMContentLoaded', function() {

        const firstModule = document.querySelector('.course-module');

        if (firstModule) {
            firstModule.classList.add('active');
        }

    });

