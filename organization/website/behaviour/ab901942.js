

let currentStep = 1;

function showStep(step) {

    currentStep = step;

    // Hide contents
    document.querySelectorAll('.step-content')
        .forEach(function(el) {
            el.classList.add('hidden');
        });

    // Show current
    document.getElementById('step' + step + 'Content')
        .classList.remove('hidden');


    // Buttons reset
    for (let i = 1; i <= 4; i++) {

        const btn =
            document.getElementById('stepBtn' + i);

        btn.classList.remove(
            'step-active',
            'step-done'
        );

        btn.classList.add(
            'bg-slate-100',
            'text-slate-500'
        );
    }


    // Completed steps
    for (let i = 1; i < step; i++) {

        const btn =
            document.getElementById('stepBtn' + i);

        btn.classList.remove(
            'bg-slate-100',
            'text-slate-500'
        );

        btn.classList.add('step-done');
    }


    // Active step
    const active =
        document.getElementById('stepBtn' + step);

    active.classList.remove(
        'bg-slate-100',
        'text-slate-500'
    );

    active.classList.add('step-active');


    // Progress
    const percentage = step * 25;

    document.getElementById('progressText')
        .innerText = percentage + '%';

    document.getElementById('progressBar')
        .style.width = percentage + '%';


    // Scroll
    document.getElementById('registration')
        .scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
}


// File upload feedback

document.querySelectorAll('input[type="file"]')
.forEach(function(input) {

    input.addEventListener('change', function() {

        if (!this.files.length) return;

        const label = this.closest('label');

        if (!label) return;

        let existing =
            label.querySelector('.selected-file');

        if (existing) {
            existing.remove();
        }

        existing =
            document.createElement('div');

        existing.className =
            'selected-file mt-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold';

        if (this.files.length === 1) {

            existing.innerText =
                '✓ ' + this.files[0].name;

        } else {

            existing.innerText =
                '✓ ' + this.files.length +
                ' files selected';

        }

        label.appendChild(existing);

    });

});

