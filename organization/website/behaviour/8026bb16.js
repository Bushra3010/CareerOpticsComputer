

document.querySelectorAll('.faq-btn').forEach(function(button) {

    button.addEventListener('click', function() {

        const item = this.closest('.faq-item');

        document.querySelectorAll('.faq-item').forEach(function(other) {

            if(other !== item) {
                other.classList.remove('active');
            }

        });

        item.classList.toggle('active');

    });

});

