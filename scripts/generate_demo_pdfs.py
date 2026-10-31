from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen.canvas import Canvas

OUT = Path(__file__).resolve().parents[1] / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
DARK = colors.HexColor("#18181b")
LIME = colors.HexColor("#c7ff2f")

def brand(c, title, ref, pagesize=A4):
    width, height = pagesize
    c.setFillColor(DARK); c.rect(0, height-108, width, 108, fill=1, stroke=0)
    c.setFillColor(LIME); c.setFont("Helvetica-Bold", 22); c.drawString(44, height-50, "CAREER OPTICS COMPUTER ACADEMY")
    c.setFillColor(colors.white); c.setFont("Helvetica", 8); c.drawString(44, height-68, "EDUCATION  |  SOFTWARE  |  SKILL DEVELOPMENT")
    c.setFont("Helvetica-Bold", 12); c.drawRightString(width-44, height-50, title)
    c.setFont("Helvetica", 8); c.drawRightString(width-44, height-67, ref)

def footer(c, pagesize=A4):
    width, _ = pagesize; c.setStrokeColor(colors.HexColor("#dddddd")); c.line(44, 38, width-44, 38)
    c.setFillColor(colors.HexColor("#666666")); c.setFont("Helvetica", 7); c.drawCentredString(width/2, 25, "Main Branch | Generated from verified Career Optics Computer Academy ERP records")

def receipt():
    p=OUT/"demo-fee-statement.pdf"; c=Canvas(str(p),pagesize=A4); w,h=A4;brand(c,"FEE STATEMENT","DEMO-STU-001")
    y=h-145
    for label,value in [("STUDENT","Aarav Sharma"),("DESCRIPTION","Course tuition fee"),("DUE DATE","07 August 2026")]:
        c.setFillColor(colors.grey);c.setFont("Helvetica",8);c.drawString(44,y,label);c.setFillColor(DARK);c.setFont("Helvetica-Bold",11);c.drawString(44,y-15,value);y-=48
    c.setFillColor(colors.HexColor("#f4f4f5"));c.roundRect(44,y-105,w-88,105,8,fill=1,stroke=0)
    for label,value,dy in [("Total fee","INR 36,000",-26),("Paid","INR 36,000",-55),("Balance due","INR 0",-84)]:c.setFillColor(DARK);c.setFont("Helvetica",10);c.drawString(62,y+dy,label);c.setFont("Helvetica-Bold",11);c.drawRightString(w-62,y+dy,value)
    footer(c);c.save();return p

def marksheet():
    p=OUT/"demo-marksheet.pdf";c=Canvas(str(p),pagesize=A4);w,h=A4;brand(c,"ACADEMIC MARKSHEET","DEMO-STU-001")
    c.setFillColor(DARK);c.setFont("Helvetica-Bold",14);c.drawString(44,h-145,"Aarav Sharma");c.setFont("Helvetica",9);c.drawString(44,h-162,"Advanced Computer Applications | Final Assessment 2026")
    y=h-205;c.setFillColor(colors.HexColor("#f4f4f5"));c.rect(44,y,w-88,26,fill=1,stroke=0)
    for x,t in [(54,"SUBJECT"),(390,"MAX"),(455,"SCORE"),(515,"RESULT")]:c.setFillColor(DARK);c.setFont("Helvetica-Bold",8);c.drawString(x,y+9,t)
    rows=[("Advanced Computer Applications - Theory",100,89,"PASS"),("Advanced Computer Applications - Practical",100,94,"PASS")]
    for subject,maxm,score,result in rows:
        y-=34;c.setFont("Helvetica",9);c.drawString(54,y+10,subject);c.drawCentredString(405,y+10,str(maxm));c.drawCentredString(475,y+10,str(score));c.drawCentredString(535,y+10,result);c.setStrokeColor(colors.HexColor("#eeeeee"));c.line(44,y,w-44,y)
    c.setFillColor(DARK);c.roundRect(360,y-75,w-404,55,7,fill=1,stroke=0);c.setFillColor(colors.white);c.setFont("Helvetica-Bold",11);c.drawCentredString(465,y-43,"TOTAL 183 / 200");c.setFillColor(LIME);c.drawCentredString(465,y-60,"91.5% | PASS")
    footer(c);c.save();return p

def certificate():
    size=landscape(A4);p=OUT/"demo-course-certificate.pdf";c=Canvas(str(p),pagesize=size);w,h=size;c.setFillColor(DARK);c.rect(0,0,w,h,fill=1,stroke=0);c.setStrokeColor(LIME);c.setLineWidth(2);c.roundRect(28,28,w-56,h-56,12,stroke=1,fill=0)
    c.setFillColor(LIME);c.setFont("Helvetica-Bold",24);c.drawCentredString(w/2,h-88,"CAREER OPTICS COMPUTER ACADEMY");c.setFillColor(colors.white);c.setFont("Helvetica-Bold",14);c.drawCentredString(w/2,h-132,"CERTIFICATE OF COURSE COMPLETION")
    c.setFillColor(colors.HexColor("#bbbbbb"));c.setFont("Helvetica",11);c.drawCentredString(w/2,h-175,"This is to certify that");c.setFillColor(colors.white);c.setFont("Helvetica-Bold",30);c.drawCentredString(w/2,h-218,"Aarav Sharma");c.setStrokeColor(LIME);c.line(215,h-230,w-215,h-230)
    c.setFont("Helvetica",12);c.drawCentredString(w/2,h-265,"has successfully completed Advanced Computer Applications");c.setFillColor(colors.HexColor("#bbbbbb"));c.setFont("Helvetica",9);c.drawCentredString(w/2,h-290,"Enrollment: DEMO-STU-001 | Main Branch");c.setFillColor(colors.white);c.drawCentredString(165,75,"13 August 2026");c.drawCentredString(w-165,75,"AUTHORIZED SIGNATORY");c.setFillColor(LIME);c.setFont("Helvetica",7);c.drawCentredString(w/2,48,"Digitally generated from verified ERP records");c.save();return p

if __name__ == "__main__":
    print("\n".join(str(p) for p in (receipt(), marksheet(), certificate())))
