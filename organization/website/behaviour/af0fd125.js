

const citizenSkills = [

"Apply for Birth Certificate online",
"Apply for Duplicate Birth Certificate",
"Apply for Aadhaar Card online",
"Download Aadhaar Card online",
"Verify Aadhaar Details online",
"Update Aadhaar Details online",
"Know Emergency Numbers",
"Get help online",
"Book appointment in Government Hospital",
"Apply for Anganwadi enrolment",
"Apply for Age, Nationality and Domicile Certificate",
"Apply for Caste Certificate",
"Apply for BPL Certificate",
"Apply for Learner Licence online",
"Book appointment for Learner Licence Test",
"Check vehicle details",
"Apply for Passport online",
"Track Passport Application Status",
"Apply for Atal Pension Yojana",
"Apply for Pradhan Mantri Suraksha Bima Yojana",
"Apply for Pradhan Mantri Jeevan Jyoti Bima Yojana",
"Store certificates in DigiLocker",
"Scan documents and store online",
"Use Google Drive for important files",
"Apply for Voter ID Card online",
"Search name in voter list",
"Know polling booth",
"Apply for Driving Licence online",
"Book driving licence test appointment",
"Learn Disaster Management",
"Apply for PAN Card",
"Apply for Income Certificate",
"Register complaint on Consumer Forum",
"Book appointment with government officer",
"Register on MGNREGA",
"View MGNREGA details",
"Check Provident Fund online",
"Use safety applications",
"Download government forms",
"Apply for Marriage Certificate online",
"Apply for Ration Card online",
"Apply for Pradhan Mantri Awas Yojana",
"Apply for Water Connection",
"Apply for Electricity Connection",
"Apply for Toilet Certificate",
"Check property records",
"Check land records",
"Apply for Sukanya Samriddhi Yojana",
"Apply for Pradhan Mantri Mudra Yojana",
"Register FIR online",
"Apply for Startup Recognition",
"Register Partnership Firm",
"Apply for Senior Citizen Certificate",
"Use mKisan portal and Kisan App",
"Check weather status",
"Get Soil Health Card information",
"Check market prices",
"Apply for Death Certificate",
"Apply for Duplicate Death Certificate"

];

document.write(
citizenSkills.map((x,i)=>`
<div class="topic-item">
<span class="topic-icon">${String(i+1).padStart(2,'0')}</span>
<span>${x}</span>
</div>
`).join('')
);

