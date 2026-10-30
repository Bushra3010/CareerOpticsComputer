/* ==========================
   STUDENT VERIFICATION
   Result (enrolment no. + date of birth), certificate, admit card and
   enrolment, looked up through the database's public verification
   functions. Nothing but what is shown here leaves the database.
========================== */

(function(){

    var cfg = window.CMS_CONFIG || {};
    var root = document.getElementById('verify');
    if(!root) return;

    function esc(v){
        return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function day(iso){
        if(!iso) return '—';
        var d = new Date(String(iso).slice(0,10) + 'T00:00:00');
        return isNaN(d) ? esc(iso) : d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    }

    function ordinal(n){
        var v = n % 100, s = ['th','st','nd','rd'];
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    /* Same rule as the ERP: a course says how it is divided, or one longer
       than a year runs in years and anything shorter is one term. */
    function termName(terms, term){
        terms = terms || {};
        var type = String(terms.termType || '').toUpperCase();
        if(!type){
            var months = String(terms.durationUnit || '').toUpperCase() === 'YEARS'
                ? (Number(terms.durationValue) || 0) * 12
                : Number(terms.durationValue) || 0;
            type = months > 12 ? 'YEAR' : 'SINGLE';
        }
        if(type === 'SINGLE') return 'Full Course';
        return ordinal(term || 1) + (type === 'SEMESTER' ? ' Semester' : ' Year');
    }

    function call(fn, body){
        if(!cfg.url || !cfg.key) return Promise.reject(new Error('Verification is not available right now.'));
        return fetch(cfg.url + '/rest/v1/rpc/' + fn, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: cfg.key,
                Authorization: 'Bearer ' + cfg.key
            },
            body: JSON.stringify(body)
        }).then(function(res){
            if(!res.ok) throw new Error('Could not verify right now. Please try again.');
            return res.json();
        });
    }

    function studentBlock(s){
        s = s || {};
        var rows = [
            ['Name', s.name], ["Father's name", s.fatherName], ['Enrollment No', s.enrollmentNo],
            ['Course', s.course], ['Institute', s.centre]
        ];
        return '<table class="v-table">' + rows.filter(function(r){ return r[1]; }).map(function(r){
            return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>';
        }).join('') + '</table>';
    }

    function notFound(msg){
        return '<div class="v-alert v-bad">' + esc(msg || 'No record found for this enrollment / application number.') + '</div>';
    }

    var renderers = {
        enrollment: function(data){
            if(!data || !data.found) return notFound();
            return '<div class="v-alert v-good">Enrollment verified.</div>' + studentBlock(data.student) +
                '<p class="v-note">Admitted on ' + day(data.student && data.student.admissionDate) + '.</p>';
        },
        result: function(data){
            if(!data || !data.found) return notFound('No result found. Check the enrollment number and date of birth.');
            var sheets = data.marksheets || [];
            if(!sheets.length) return studentBlock(data.student) + notFound('The result has not been declared yet.');
            return studentBlock(data.student) + sheets.map(function(m){
                var lines = (m.marks || []).map(function(l){
                    var t = l.subjectType !== 'PRACTICAL', p = l.subjectType !== 'THEORY';
                    return '<tr><td>' + esc(l.code || '') + '</td><td>' + esc(l.name) + '</td>' +
                        '<td>' + (t ? esc(l.theory) + ' / ' + esc(l.theoryMax) : '—') + '</td>' +
                        '<td>' + (p ? esc(l.practical) + ' / ' + esc(l.practicalMax) : '—') + '</td></tr>';
                }).join('');
                return '<h3 class="v-h3">' + esc(termName(data.courseTerms, m.term)) + (m.session ? ' · ' + esc(m.session) : '') + '</h3>' +
                    '<table class="v-table v-marks"><thead><tr><th>Code</th><th>Subject</th><th>Theory</th><th>Practical</th></tr></thead><tbody>' + lines + '</tbody></table>' +
                    '<div class="v-summary">Total <b>' + esc(m.totalObtained) + '</b> / ' + esc(m.totalMax) +
                    ' · <b>' + esc(m.percentage) + '%</b> · Grade <b>' + esc(m.grade) + '</b> · ' +
                    '<span class="' + (m.result === 'PASS' ? 'v-pass' : 'v-fail') + '">' + esc(m.result) + '</span></div>';
            }).join('');
        },
        certificate: function(data){
            if(!data || !data.found) return notFound();
            if(!data.issued) return studentBlock(data.student) + notFound('No certificate has been issued to this enrollment number yet.');
            var rows = [
                ['Certificate No', data.certificateNo], ['Issue date', day(data.issueDate)],
                ['Examination held', data.examConductedDate ? day(data.examConductedDate) : ''],
                ['Result', data.percentage != null ? data.percentage + '% · Grade ' + (data.grade || '') : '']
            ];
            return '<div class="v-alert v-good">This certificate is genuine.</div>' + studentBlock(data.student) +
                '<table class="v-table">' + rows.filter(function(r){ return r[1]; }).map(function(r){
                    return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>';
                }).join('') + '</table>';
        },
        admit: function(data){
            if(!data || !data.found) return notFound();
            if(!data.issued) return studentBlock(data.student) + notFound('The admit card has not been issued yet.');
            var centre = data.examCentre || {};
            var rows = (data.schedule || []).map(function(s){
                return '<tr><td>' + esc(s.code || '') + '</td><td>' + esc(s.subject) + '</td><td>' + day(s.date) + '</td><td>' + esc(s.time) + '</td></tr>';
            }).join('');
            return '<div id="admit-print" class="v-card"><h3 class="v-h3">ADMIT CARD — ' + esc(termName(data.courseTerms, data.term)) +
                (data.session ? ' (' + esc(data.session) + ')' : '') + '</h3>' + studentBlock(data.student) +
                '<table class="v-table"><tr><th>Roll No</th><td><b>' + esc(data.rollNo) + '</b></td></tr>' +
                (centre.name ? '<tr><th>Exam centre</th><td>' + esc([centre.name, centre.address].filter(Boolean).join(', ')) + '</td></tr>' : '') +
                '</table><table class="v-table v-marks"><thead><tr><th>Code</th><th>Subject</th><th>Date</th><th>Time</th></tr></thead><tbody>' +
                (rows || '<tr><td colspan="4">Schedule to be announced.</td></tr>') + '</tbody></table></div>' +
                '<button type="button" class="v-btn" data-print-admit>Print admit card</button>';
        }
    };

    var FN = { enrollment: 'verify_enrollment', result: 'verify_result', certificate: 'verify_certificate', admit: 'public_admit_card' };

    function show(tab){
        root.querySelectorAll('[data-tab]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab') === tab); });
        root.querySelectorAll('[data-panel]').forEach(function(p){ p.hidden = p.getAttribute('data-panel') !== tab; });
    }

    root.querySelectorAll('[data-tab]').forEach(function(b){
        b.addEventListener('click', function(){ show(b.getAttribute('data-tab')); history.replaceState(null, '', '#' + b.getAttribute('data-tab')); });
    });
    var start = (location.hash || '').replace('#','');
    show(FN[start] ? start : 'result');

    root.querySelectorAll('form[data-kind]').forEach(function(form){
        form.addEventListener('submit', function(e){
            e.preventDefault();
            var kind = form.getAttribute('data-kind');
            var out = root.querySelector('[data-out="' + kind + '"]');
            var enrollment = (form.querySelector('[name="enrollment"]').value || '').trim();
            if(!enrollment){ out.innerHTML = notFound('Enter the enrollment or application number.'); return; }
            var body = { p_enrollment: enrollment };
            if(kind === 'result'){
                var dob = form.querySelector('[name="dob"]').value;
                if(!dob){ out.innerHTML = notFound('Enter the date of birth.'); return; }
                body.p_dob = dob;
            }
            out.innerHTML = '<p class="v-note">Checking…</p>';
            call(FN[kind], body).then(function(data){
                out.innerHTML = renderers[kind](data);
            }).catch(function(err){
                out.innerHTML = notFound(err.message);
            });
        });
    });

    root.addEventListener('click', function(e){
        if(!e.target.closest('[data-print-admit]')) return;
        var card = document.getElementById('admit-print');
        if(!card) return;
        var w = window.open('', '_blank');
        if(!w) return;
        w.document.write('<html><head><title>Admit card</title><style>' + document.getElementById('verify-style').textContent +
            'body{font-family:system-ui,sans-serif;padding:24px}</style></head><body>' + card.outerHTML + '</body></html>');
        w.document.close();
        w.focus();
        w.print();
    });

})();
