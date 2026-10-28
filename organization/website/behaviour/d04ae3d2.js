

function toggleModule(button) {

    const item = button.closest('.syllabus-item');

    document.querySelectorAll('.syllabus-item').forEach(function(el) {

        if (el !== item) {
            el.classList.remove('active');
        }

    });

    item.classList.toggle('active');
}

