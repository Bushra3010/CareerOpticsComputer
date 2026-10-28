
    const callButton = document.getElementById("callButton");
    const callPopup = document.getElementById("callPopup");

    callButton.addEventListener("click", function () {
        callPopup.classList.toggle("show");
    });

    // Close when clicking outside
    document.addEventListener("click", function (event) {

        if (!event.target.closest(".modern-call-wrapper")) {
            callPopup.classList.remove("show");
        }

    });
