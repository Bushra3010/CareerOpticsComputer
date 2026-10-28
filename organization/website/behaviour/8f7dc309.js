

let currentStep = 1;


/* ==========================
   STEP NAVIGATION
========================== */

function nextStep(step){

    document.querySelectorAll('.step').forEach(function(el){
        el.classList.remove('active');
    });

    document.getElementById('step' + step).classList.add('active');

    currentStep = step;

    updateProgress(step);

    document.getElementById('registration').scrollIntoView({
        behavior:'smooth',
        block:'start'
    });
}


/* ==========================
   PROGRESS BAR
========================== */

function updateProgress(step){

    let percentage = step * 25;

    document.getElementById('progressBar').style.width =
        percentage + '%';

}


/* ==========================
   FILE NAME
========================== */

function showFile(input,target){

    let targetElement =
        document.getElementById(target);

    if(input.files.length){

        targetElement.innerHTML =
            '✓ ' + input.files[0].name;

        targetElement.classList.add(
            'text-emerald-600',
            'font-semibold'
        );

    }

}


/* ==========================
   INSTITUTE PHOTOS
========================== */

function checkPhotos(input){

    let message =
        document.getElementById('photosName');

    if(input.files.length < 4){

        message.innerHTML =
            '⚠ Please select at least 4 institute photos.';

        message.className =
            'file-name text-red-500 font-semibold';

    }else{

        message.innerHTML =
            '✓ ' + input.files.length +
            ' institute photos selected';

        message.className =
            'file-name text-emerald-600 font-semibold';

    }

}


/* ==========================
   DOCUMENT VALIDATION
========================== */

function validateDocuments(){

    let photos =
        document.querySelector(
            'input[name="institute_photos[]"]'
        );

    if(photos.files.length < 4){

        alert(
            'Please upload at least 4 institute photos.'
        );

        return;

    }

    nextStep(4);

}


/* ==========================
   FORM SUBMIT
========================== */

document.getElementById('franchiseForm')
.addEventListener('submit',function(e){

    let photos =
        document.querySelector(
            'input[name="institute_photos[]"]'
        );

    if(photos.files.length < 4){

        e.preventDefault();

        alert(
            'Please upload at least 4 institute photos.'
        );

        nextStep(3);

        return;
    }

});

