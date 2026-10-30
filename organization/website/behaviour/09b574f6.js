

const studySkills = [

"Use Google to search study information",
"Use Wikipedia for information research",
"Search tutor services online",
"Listen to online stories and classic literature",
"Watch educational videos",
"Search and download eBooks",
"Improve vocabulary using digital tools",
"Grammar and spell checking",
"Search synonyms and antonyms",
"Organize notes using Google Keep",
"Track events and classes using Google Calendar",
"Share notes using Google Docs",
"Watch educational talks",
"Participate in live discussions",
"Learn through online forums",
"Learn a new language using digital apps",
"Join MOOCs",
"Join online courses",
"Learn subjects through free online platforms",
"Learn from NPTEL",
"Learn through Khan Academy",
"Express ideas using Mindmap tools",
"Research world information",
"Explore science and educational experiments",
"Learn History using digital resources",
"Improve abilities through educational games",
"Perform science experiments",
"Perform mathematics experiments",
"Perform chemistry experiments",
"Test IQ online",
"Prepare for competitive examinations",
"Share information using SlideShare",
"Create presentations and receive feedback",
"Perform clustered searches",
"Learn Indian History chronologically",
"Create a technology blog",
"Check project reports for plagiarism",
"Access online research papers",
"Collaborate with peers for competitive exams",
"Understand personality types",
"Conduct polls and surveys using online forms",
"Create home and interior designs using online tools",
"Create digital art using tablet applications"

];

document.write(
studySkills.map((x,i)=>`
<div class="topic-item">
<span class="topic-icon">${String(i+1).padStart(2,'0')}</span>
<span>${x}</span>
</div>
`).join('')
);

