

function toggleMonth(button){

    const month = button.parentElement;

    document.querySelectorAll('.month').forEach(item => {

        if(item !== month){
            item.classList.remove('active');
        }

    });

    month.classList.toggle('active');
}

