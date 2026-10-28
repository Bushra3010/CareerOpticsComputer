

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================
           LUCIDE
        ===================================== */

        lucide.createIcons();


        /* =====================================
           MOBILE MENU
        ===================================== */

        const menuBtn =
            document.getElementById("menuBtn");

        const mobileMenu =
            document.getElementById("mobileMenu");


        function openMobileMenu() {

            mobileMenu.classList.add("show");

            menuBtn.setAttribute(
                "aria-expanded",
                "true"
            );

            menuBtn.setAttribute(
                "aria-label",
                "Close menu"
            );


            menuBtn.innerHTML = `
                <i
                    data-lucide="x"
                    class="w-5 h-5">
                </i>
            `;

            lucide.createIcons();
        }


        function closeMobileMenu() {

            mobileMenu.classList.remove("show");

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

            menuBtn.setAttribute(
                "aria-label",
                "Open menu"
            );


            menuBtn.innerHTML = `
                <i
                    data-lucide="menu"
                    class="w-5 h-5">
                </i>
            `;

            lucide.createIcons();


            closeMobileDropdowns();
        }


        menuBtn.addEventListener(
            "click",
            function (e) {

                e.stopPropagation();


                if (
                    mobileMenu.classList.contains(
                        "show"
                    )
                ) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();

                }

            }
        );


        /* =====================================
           MOBILE DROPDOWNS
        ===================================== */

        const mobileDropdowns =
            document.querySelectorAll(
                ".mobile-dropdown"
            );


        mobileDropdowns.forEach(
            function (dropdown) {

                const button =
                    dropdown.querySelector(
                        ".mobile-dropdown-btn"
                    );


                button.addEventListener(
                    "click",
                    function (e) {

                        e.stopPropagation();


                        const isOpen =
                            dropdown.classList.contains(
                                "open"
                            );


                        /* Close all */

                        mobileDropdowns.forEach(
                            function (item) {

                                item.classList.remove(
                                    "open"
                                );


                                const btn =
                                    item.querySelector(
                                        ".mobile-dropdown-btn"
                                    );

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                        /* Open selected */

                        if (!isOpen) {

                            dropdown.classList.add(
                                "open"
                            );

                            button.classList.add(
                                "active"
                            );

                        }

                    }
                );

            }
        );


        /* =====================================
           DESKTOP DROPDOWNS
        ===================================== */

        const desktopDropdowns =
            document.querySelectorAll(
                ".desktop-dropdown"
            );


        desktopDropdowns.forEach(
            function (dropdown) {

                const button =
                    dropdown.querySelector(
                        ".desktop-dropdown-btn"
                    );


                button.addEventListener(
                    "click",
                    function (e) {

                        e.stopPropagation();


                        const isOpen =
                            dropdown.classList.contains(
                                "open"
                            );


                        /* Close all */

                        desktopDropdowns.forEach(
                            function (item) {

                                item.classList.remove(
                                    "open"
                                );

                            }
                        );


                        /* Open selected */

                        if (!isOpen) {

                            dropdown.classList.add(
                                "open"
                            );

                        }

                    }
                );

            }
        );


        /* =====================================
           CLOSE MOBILE DROPDOWNS
        ===================================== */

        function closeMobileDropdowns() {

            mobileDropdowns.forEach(
                function (dropdown) {

                    dropdown.classList.remove(
                        "open"
                    );


                    const button =
                        dropdown.querySelector(
                            ".mobile-dropdown-btn"
                        );


                    button.classList.remove(
                        "active"
                    );

                }
            );

        }


        /* =====================================
           CLOSE OUTSIDE CLICK
        ===================================== */

        document.addEventListener(
            "click",
            function (e) {


                /* Desktop */

                if (
                    !e.target.closest(
                        ".desktop-dropdown"
                    )
                ) {

                    desktopDropdowns.forEach(
                        function (dropdown) {

                            dropdown.classList.remove(
                                "open"
                            );

                        }
                    );

                }


                /* Mobile */

                if (
                    mobileMenu.classList.contains(
                        "show"
                    ) &&
                    !mobileMenu.contains(
                        e.target
                    ) &&
                    !menuBtn.contains(
                        e.target
                    )
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* =====================================
           MOBILE LINKS CLOSE MENU
        ===================================== */

        const mobileLinks =
            mobileMenu.querySelectorAll(
                "a"
            );


        mobileLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        closeMobileMenu();

                    }
                );

            }
        );


        /* =====================================
           ESC KEY
        ===================================== */

        document.addEventListener(
            "keydown",
            function (e) {

                if (e.key === "Escape") {

                    closeMobileMenu();


                    desktopDropdowns.forEach(
                        function (dropdown) {

                            dropdown.classList.remove(
                                "open"
                            );

                        }
                    );

                }

            }
        );


        /* =====================================
           RESIZE
        ===================================== */

        window.addEventListener(
            "resize",
            function () {

                if (window.innerWidth >= 1024) {

                    closeMobileMenu();

                }

            }
        );

    }
);

