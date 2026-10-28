

const dailySkills = [

"Use Google PlayStore and download apps",
"Use digital payment applications for cashless transactions",
"Open and use net banking",
"Use credit/debit card for online shopping",
"Create and operate an email account",
"Reset email password",
"Pay telephone bills online",
"Pay electricity bills online",
"Recharge mobile phone online",
"Protect yourself from cyber bullying",
"Browse web pages",
"Add websites to favourite folder",
"Configure and activate Internet connection",
"Share files between devices",
"Scan documents using mobile applications",
"Print and save web pages",
"Understand importance of strong passwords",
"Build professional network",
"Book movie tickets online",
"Search jobs online",
"Use GPS and map applications",
"Read newspapers online",
"Share presentations online",
"Use online entertainment applications",
"Online shopping",
"Sell used products online",
"Use mobile browsers",
"Send and receive eFax",
"Find GST related information",
"Type messages in different languages",
"Send bulk messages",
"Pay income tax online",
"Use cloud note applications",
"Use online learning applications",
"Participate in webinars",
"Book train tickets online",
"Organize trips online",
"Book air tickets online",
"Scan QR codes",
"Book gas refill online",
"Store files on external media",
"Use Google Maps",
"Improve computer performance",
"Transfer data between devices",
"Capture screen using Snipping Tool",
"Compress and decompress files",
"Protect computer from viruses",
"Connect computer to a projector"

];

document.write(
dailySkills.map((x,i)=>`
<div class="topic-item">
<span class="topic-icon">${String(i+1).padStart(2,'0')}</span>
<span>${x}</span>
</div>
`).join('')
);

