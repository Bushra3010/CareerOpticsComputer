/* ==========================
   STATE → DISTRICT → BLOCK
   Each list waits for the one before it. A district whose blocks are not
   listed, or a block picked as "Other", is typed in instead.
========================== */

(function(){

    var data = document.getElementById('place-data');
    if(!data) return;
    var places = JSON.parse(data.textContent || '{}');
    var OTHER = '__other__';

    function fill(select, placeholder, names, withOther){
        select.innerHTML = '';
        var first = new Option(placeholder, '');
        first.disabled = true;
        first.selected = true;
        select.add(first);
        names.forEach(function(name){ select.add(new Option(name, name)); });
        if(withOther) select.add(new Option('Other (type your own)…', OTHER));
        select.disabled = names.length === 0 && !withOther;
    }

    document.querySelectorAll('select[data-place="state"]').forEach(function(stateSelect){
        var form = stateSelect.form || document;
        var districtSelect = form.querySelector('select[data-place="district"]');
        var blockSelect = form.querySelector('select[data-place="block"]');
        var blockOther = form.querySelector('input[data-place="block-other"]');
        if(!districtSelect) return;

        // While the block is typed, the box carries the name and the
        // dropdown, left on "Other", is not submitted.
        function typeBlock(on){
            if(blockSelect) blockSelect.name = on ? '' : 'block';
            if(!blockOther) return;
            blockOther.hidden = !on;
            blockOther.disabled = !on;
            if(on) blockOther.focus(); else blockOther.value = '';
        }

        function resetBlocks(placeholder){
            if(!blockSelect) return;
            fill(blockSelect, placeholder, [], false);
            blockSelect.disabled = true;
            typeBlock(false);
        }

        stateSelect.addEventListener('change', function(){
            var districts = (places.districts || {})[stateSelect.value] || [];
            fill(districtSelect, 'Select district', districts, false);
            resetBlocks('Select district first');
        });

        districtSelect.addEventListener('change', function(){
            if(!blockSelect) return;
            var byState = (places.blocks || {})[stateSelect.value] || {};
            var blocks = byState[districtSelect.value] || [];
            fill(blockSelect, blocks.length ? 'Select block' : 'Select or type the block', blocks, true);
            typeBlock(false);
        });

        if(blockSelect){
            blockSelect.addEventListener('change', function(){
                typeBlock(blockSelect.value === OTHER);
            });
        }
    });

})();
