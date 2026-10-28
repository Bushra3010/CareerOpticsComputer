

function toggleModule(button) {

    const content = button.nextElementSibling;
    const icon = button.querySelector('span:last-child');

    if (content.classList.contains('hidden')) {

        content.classList.remove('hidden');
        icon.textContent = '−';

        button.classList.add('bg-indigo-50');

    } else {

        content.classList.add('hidden');
        icon.textContent = '+';

        button.classList.remove('bg-indigo-50');

    }

}

