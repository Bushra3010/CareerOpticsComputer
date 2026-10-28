
const communicationModules = [
"Home, Surroundings and Routine",
"Greetings",
"Friends, Family and Relatives",
"Food",
"Health and Hygiene",
"Telling Time and Giving Directions",
"News",
"Making Enquiries",
"Communicating at Common Public Places",
"Helping and Offering Services",
"Getting Ready for Work",
"Telephonic Conversation",
"Sharing Thoughts with Others",
"Using References like Dictionary and Thesaurus",
"Communication in Cyber World",
"Interview Techniques",
"Meetings at Workplace",
"Workplace Ethics",
"Customer Service",
"Safety"
];

document.write(
communicationModules.map((x,i)=>`
<div class="topic-item">
<span class="topic-icon">${String(i+1).padStart(2,'0')}</span>
<span>${x}</span>
</div>
`).join('')
);
