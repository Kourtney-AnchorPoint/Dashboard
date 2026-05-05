from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import Flowable, Image
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.lib import colors
import os

# ── Brand colors ──────────────────────────────────────────────────────────
BG       = HexColor('#07070F')
MAGENTA  = HexColor('#D4159A')
PURPLE   = HexColor('#8844E8')
CYAN     = HexColor('#10D8F0')
WHITE    = HexColor('#FFFFFF')
LIGHT    = HexColor('#E8E8F0')
DIMGRAY  = HexColor('#9090A8')
DARKCARD = HexColor('#111122')
CARDLINE = HexColor('#2A2A44')

PAGE_W, PAGE_H = letter
MARGIN = 0.55 * inch

# ── Custom background canvas ───────────────────────────────────────────────
class BrandedCanvas(pdfcanvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._page_count = 0

    def showPage(self):
        self._draw_background()
        super().showPage()
        self._page_count += 1

    def save(self):
        self._draw_background()
        super().save()

    def _draw_background(self):
        self.saveState()
        self.setFillColor(BG)
        self.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        # Subtle gradient-ish strips at top
        self.setFillColor(HexColor('#0D0D22'))
        self.rect(0, PAGE_H - 3*inch, PAGE_W, 3*inch, fill=1, stroke=0)
        self.restoreState()

# ── Styles ────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

HERO_TAG = S('hero_tag',
    fontName='Helvetica-Bold', fontSize=9, textColor=CYAN,
    alignment=TA_CENTER, letterSpacing=3, leading=14,
    spaceAfter=6)

HERO_TITLE = S('hero_title',
    fontName='Helvetica-Bold', fontSize=30, textColor=WHITE,
    alignment=TA_CENTER, leading=36, spaceAfter=4)

HERO_SUB = S('hero_sub',
    fontName='Helvetica', fontSize=13, textColor=LIGHT,
    alignment=TA_CENTER, leading=18, spaceAfter=10)

HERO_TAGLINE = S('hero_tagline',
    fontName='Helvetica-Oblique', fontSize=11, textColor=MAGENTA,
    alignment=TA_CENTER, leading=16, spaceAfter=6)

SECTION_LABEL = S('sec_label',
    fontName='Helvetica-Bold', fontSize=8, textColor=CYAN,
    letterSpacing=2.5, leading=12, spaceBefore=18, spaceAfter=4)

SECTION_TITLE = S('sec_title',
    fontName='Helvetica-Bold', fontSize=18, textColor=WHITE,
    leading=22, spaceAfter=6)

BODY = S('body',
    fontName='Helvetica', fontSize=10, textColor=LIGHT,
    leading=16, spaceAfter=8, alignment=TA_JUSTIFY)

BODY_BOLD = S('body_bold',
    fontName='Helvetica-Bold', fontSize=10, textColor=WHITE,
    leading=16, spaceAfter=4)

CALLOUT = S('callout',
    fontName='Helvetica-Bold', fontSize=15, textColor=MAGENTA,
    alignment=TA_CENTER, leading=20, spaceBefore=6, spaceAfter=6)

STAT_NUM = S('stat_num',
    fontName='Helvetica-Bold', fontSize=26, textColor=MAGENTA,
    alignment=TA_CENTER, leading=30, spaceAfter=2)

STAT_LBL = S('stat_lbl',
    fontName='Helvetica', fontSize=9, textColor=DIMGRAY,
    alignment=TA_CENTER, leading=13, spaceAfter=2)

STAT_DESC = S('stat_desc',
    fontName='Helvetica', fontSize=8.5, textColor=LIGHT,
    alignment=TA_CENTER, leading=12, spaceAfter=0)

BULLET = S('bullet',
    fontName='Helvetica', fontSize=10, textColor=LIGHT,
    leading=16, spaceAfter=5, leftIndent=14)

PILL_TXT = S('pill',
    fontName='Helvetica-Bold', fontSize=9, textColor=WHITE,
    alignment=TA_CENTER, leading=14, spaceBefore=2, spaceAfter=2)

FOOTER_TXT = S('footer',
    fontName='Helvetica', fontSize=8, textColor=DIMGRAY,
    alignment=TA_CENTER, leading=12)

QUOTE = S('quote',
    fontName='Helvetica-Oblique', fontSize=11.5, textColor=LIGHT,
    alignment=TA_CENTER, leading=18, spaceBefore=4, spaceAfter=4)

CTA_HEAD = S('cta_head',
    fontName='Helvetica-Bold', fontSize=16, textColor=WHITE,
    alignment=TA_CENTER, leading=20, spaceAfter=6)

CTA_BODY = S('cta_body',
    fontName='Helvetica', fontSize=10.5, textColor=LIGHT,
    alignment=TA_CENTER, leading=16, spaceAfter=6)

SMALL_LABEL = S('small_label',
    fontName='Helvetica-Bold', fontSize=9, textColor=CYAN,
    alignment=TA_CENTER, leading=12, spaceAfter=2)

# ── Helpers ───────────────────────────────────────────────────────────────
def hline(color=PURPLE, thickness=0.8):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceAfter=10, spaceBefore=6)

def magenta_rule():
    return HRFlowable(width='100%', thickness=1.5, color=MAGENTA, spaceAfter=12, spaceBefore=4)

def stat_card(number, label, description):
    return Table(
        [[Paragraph(number, STAT_NUM)],
         [Paragraph(label, STAT_LBL)],
         [Paragraph(description, STAT_DESC)]],
        colWidths=[2.1*inch],
        style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), DARKCARD),
            ('BOX',        (0,0), (-1,-1), 0.8, CARDLINE),
            ('TOPPADDING',    (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING',   (0,0), (-1,-1), 6),
            ('RIGHTPADDING',  (0,0), (-1,-1), 6),
            ('LINEABOVE', (0,0), (-1,0), 2, MAGENTA),
        ])
    )

def feature_card(icon, title, desc):
    return Table(
        [[Paragraph(f'<font color="#10D8F0">{icon}</font>', ParagraphStyle('icon', fontName='Helvetica-Bold', fontSize=14, textColor=CYAN, leading=18)),
          Paragraph(f'<b><font color="#FFFFFF">{title}</font></b><br/><font color="#C0C0D0" size="9">{desc}</font>',
                    ParagraphStyle('fc', fontName='Helvetica', fontSize=9, textColor=LIGHT, leading=14))]],
        colWidths=[0.4*inch, 2.8*inch],
        style=TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), DARKCARD),
            ('BOX',           (0,0), (-1,-1), 0.5, CARDLINE),
            ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING',   (0,0), (-1,-1), 8),
            ('RIGHTPADDING',  (0,0), (-1,-1), 8),
            ('LINEABOVE',     (0,0), (-1,0), 1.5, PURPLE),
        ])
    )

# ── Build document ────────────────────────────────────────────────────────
OUTPUT = '/app/CensusGuard_Brochure.pdf'

story = []

# ─── HERO SECTION ─────────────────────────────────────────────────────────
# Logo
logo_path = '/app/app/incoming_files/c3d5295ac_CensusGuard_banner_logo.png'
anchor_logo = '/app/app/incoming_files/3550831ed_AnchorPoint_Logo_Right_Final1.png'

if os.path.exists(logo_path):
    try:
        img = Image(logo_path, width=3.2*inch, height=0.85*inch, kind='proportional')
        img.hAlign = 'CENTER'
        story.append(Spacer(1, 0.35*inch))
        story.append(img)
        story.append(Spacer(1, 0.15*inch))
    except:
        story.append(Spacer(1, 0.4*inch))
        story.append(Paragraph("CensusGuard", HERO_TITLE))
else:
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph("CensusGuard", HERO_TITLE))

story.append(Paragraph("AI-POWERED PATIENT RETENTION FOR BEHAVIORAL HEALTH", HERO_TAG))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph(
    "Real-time risk intelligence that tells your clinical team<br/>"
    "who's about to leave — and <i>why</i> — before it's too late.",
    HERO_SUB))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph('"See the signs before the shift."', HERO_TAGLINE))
story.append(Spacer(1, 0.1*inch))
story.append(magenta_rule())

# ─── THE PROBLEM ──────────────────────────────────────────────────────────
story.append(Paragraph("THE PROBLEM", SECTION_LABEL))
story.append(Paragraph("Patients are leaving. The warning signs are invisible.", SECTION_TITLE))
story.append(Paragraph(
    "Every day, patients walk out of addiction treatment before it's over. Staff don't see it coming — "
    "not because they don't care, but because the warning signs are buried in data no one has time to read. "
    "In Oklahoma alone, nearly <b>1 in 2</b> SUD patients leaves treatment before completion — "
    "46% above the national average.",
    BODY))

# Stat cards row
stats_row = Table(
    [[stat_card("1 in 3", "PATIENTS NATIONALLY", "Leave treatment before completion"),
      stat_card("49.9%", "OKLAHOMA AMA RATE", "46% above the national average of 34.1%"),
      stat_card("$150K+", "MONTHLY REVENUE LOST", "Per 30-bed facility losing 10 patients/mo")]],
    colWidths=[2.1*inch, 2.1*inch, 2.1*inch],
    hAlign='CENTER',
    style=TableStyle([
        ('LEFTPADDING',  (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING',   (0,0), (-1,-1), 0),
        ('BOTTOMPADDING',(0,0), (-1,-1), 0),
    ])
)
story.append(stats_row)
story.append(Spacer(1, 0.15*inch))
story.append(hline())

# ─── THE SOLUTION ─────────────────────────────────────────────────────────
story.append(Paragraph("THE SOLUTION", SECTION_LABEL))
story.append(Paragraph("CensusGuard — Real-Time Clinical Intelligence", SECTION_TITLE))
story.append(Paragraph(
    "CensusGuard is an AI-powered performance operating system built specifically for SUD and behavioral health facilities. "
    "It plugs directly into your existing EHR data — <b>no new hardware, no wearables, no workflow disruption.</b> "
    "Our model was trained on nearly <b>1 million patient records</b> and delivers real-time risk scores on every patient "
    "at every BHT check-in, so clinicians act on facts — not instinct alone.",
    BODY))

# Feature cards — 2 columns
fc1 = feature_card("⚡", "Real-Time Risk Scoring", "Dynamic 0–100 risk score recalculated at every BHT check-in. No batch. No lag.")
fc2 = feature_card("🎯", "Predictive Risk Tiers", "LOW / MODERATE / HIGH / CRITICAL — with the exact drivers behind each score.")
fc3 = feature_card("📊", "Admission Intelligence", "89.6% AUC-ROC accuracy. Scored from Day 1 intake data alone.")
fc4 = feature_card("🔔", "Automated Alerts", "Instant clinical alerts with actionable context when risk escalates fast.")
fc5 = feature_card("👥", "Group Cohesion Tracking", "Unit-level energy and social dynamics — see contagion before it spreads.")
fc6 = feature_card("🔗", "EHR Integration", "Connects to Kipu and major behavioral health EHRs via secure API. HIPAA Compliant.")

feat_table = Table(
    [[fc1, fc2], [fc3, fc4], [fc5, fc6]],
    colWidths=[3.2*inch, 3.2*inch],
    hAlign='CENTER',
    style=TableStyle([
        ('LEFTPADDING',  (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING',   (0,0), (-1,-1), 4),
        ('BOTTOMPADDING',(0,0), (-1,-1), 4),
    ])
)
story.append(feat_table)
story.append(Spacer(1, 0.12*inch))
story.append(hline())

# ─── HOW IT WORKS ─────────────────────────────────────────────────────────
story.append(Paragraph("HOW IT WORKS", SECTION_LABEL))
story.append(Paragraph("Frictionless. Fast. Clinical-grade.", SECTION_TITLE))

steps = [
    ("01", "Connect", "CensusGuard integrates with your existing EHR via secure API — no new software for staff to learn."),
    ("02", "Score", "Every BHT check-in triggers a real-time rescore. Our AI evaluates 29 clinical and behavioral factors simultaneously."),
    ("03", "Alert", "When risk escalates — or velocity spikes — your clinical team gets an immediate, actionable alert with the exact reasons why."),
    ("04", "Act", "Staff document interventions directly in the platform. Every action, timestamp, and outcome is captured for compliance and quality improvement."),
]

for num, title, desc in steps:
    row = Table(
        [[Paragraph(f'<font color="#D4159A"><b>{num}</b></font>', ParagraphStyle('stepnum', fontName='Helvetica-Bold', fontSize=18, textColor=MAGENTA, leading=22, alignment=TA_CENTER)),
          Paragraph(f'<b><font color="#FFFFFF">{title}</font></b><br/><font color="#C0C0D0">{desc}</font>',
                    ParagraphStyle('stepdesc', fontName='Helvetica', fontSize=10, textColor=LIGHT, leading=15))]],
        colWidths=[0.55*inch, 6.0*inch],
        style=TableStyle([
            ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING',   (0,0), (0,0),   0),
            ('LEFTPADDING',   (1,0), (1,0),   10),
            ('LINEABOVE',     (0,0), (-1,0), 0.4, CARDLINE),
        ])
    )
    story.append(row)

story.append(Spacer(1, 0.12*inch))
story.append(hline())

# ─── ROI ──────────────────────────────────────────────────────────────────
story.append(Paragraph("THE BUSINESS CASE", SECTION_LABEL))
story.append(Paragraph("Protect your census. Protect your revenue.", SECTION_TITLE))
story.append(Paragraph(
    "At <b>$200 per bed per month</b> — flat rate, no tiers — CensusGuard is priced to be the easiest "
    "line item to justify in your budget. One prevented AMA discharge pays for months of access.",
    BODY))

roi_table = Table(
    [[Paragraph("<b>Facility Size</b>", ParagraphStyle('rh', fontName='Helvetica-Bold', fontSize=9, textColor=CYAN, leading=13)),
      Paragraph("<b>Monthly Cost</b>", ParagraphStyle('rh', fontName='Helvetica-Bold', fontSize=9, textColor=CYAN, leading=13)),
      Paragraph("<b>Revenue Recovered*</b>", ParagraphStyle('rh', fontName='Helvetica-Bold', fontSize=9, textColor=CYAN, leading=13)),
      Paragraph("<b>Estimated ROI</b>", ParagraphStyle('rh', fontName='Helvetica-Bold', fontSize=9, textColor=CYAN, leading=13))],
     [Paragraph("30-bed SUD facility", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=LIGHT, leading=13)),
      Paragraph("$6,000/mo", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=WHITE, leading=13)),
      Paragraph("$60,000 – $90,000", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=WHITE, leading=13)),
      Paragraph("9x – 12x", ParagraphStyle('rb', fontName='Helvetica-Bold', fontSize=9, textColor=MAGENTA, leading=13))],
     [Paragraph("75-bed residential center", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=LIGHT, leading=13)),
      Paragraph("$15,000/mo", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=WHITE, leading=13)),
      Paragraph("$150,000 – $200,000", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=WHITE, leading=13)),
      Paragraph("10x – 13x", ParagraphStyle('rb', fontName='Helvetica-Bold', fontSize=9, textColor=MAGENTA, leading=13))],
     [Paragraph("200-bed multi-site operator", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=LIGHT, leading=13)),
      Paragraph("$40,000/mo", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=WHITE, leading=13)),
      Paragraph("$500,000+", ParagraphStyle('rb', fontName='Helvetica', fontSize=9, textColor=WHITE, leading=13)),
      Paragraph("12x+", ParagraphStyle('rb', fontName='Helvetica-Bold', fontSize=9, textColor=MAGENTA, leading=13))],
    ],
    colWidths=[1.8*inch, 1.3*inch, 1.8*inch, 1.7*inch],
    style=TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  HexColor('#1A1A33')),
        ('BACKGROUND',    (0,1), (-1,-1), DARKCARD),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [DARKCARD, HexColor('#0E0E20')]),
        ('BOX',           (0,0), (-1,-1), 0.8, CARDLINE),
        ('GRID',          (0,0), (-1,-1), 0.3, HexColor('#1E1E38')),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('RIGHTPADDING',  (0,0), (-1,-1), 10),
        ('LINEABOVE',     (0,0), (-1,0), 2, PURPLE),
    ])
)
story.append(roi_table)
story.append(Paragraph("<i>*Based on avg $15K/stay, 4+ additional patient completions/month prevented by CensusGuard alerts.</i>",
    ParagraphStyle('footnote', fontName='Helvetica-Oblique', fontSize=7.5, textColor=DIMGRAY, leading=11, spaceAfter=4)))
story.append(Spacer(1, 0.08*inch))
story.append(hline())

# ─── ABOUT / FOUNDER ──────────────────────────────────────────────────────
story.append(Paragraph("OUR STORY", SECTION_LABEL))
story.append(Paragraph("Built by someone who lived it.", SECTION_TITLE))
story.append(Paragraph(
    "AnchorPoint Health Systems was founded by <b>Kourtney Rhodes</b> — a behavioral health tech entrepreneur, "
    "AI product management certified professional (Duke University), and person with lived experience in addiction recovery. "
    "She built CensusGuard because she knows what it feels like to be the patient on the other side of this gap.",
    BODY))

quote_box = Table(
    [[Paragraph(
        '"I built this company because the system that was supposed to save my life almost killed me. '
        'Now I\'m using AI to make sure nobody else falls through the cracks."',
        QUOTE),
     ]],
    colWidths=[6.5*inch],
    style=TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), HexColor('#12082A')),
        ('BOX',           (0,0), (-1,-1), 1.5, PURPLE),
        ('LEFTPADDING',   (0,0), (-1,-1), 20),
        ('RIGHTPADDING',  (0,0), (-1,-1), 20),
        ('TOPPADDING',    (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
        ('LINEBEFORE',    (0,0), (0,-1), 4, MAGENTA),
    ])
)
story.append(quote_box)
story.append(Spacer(1, 0.08*inch))

team_txt = (
    "<b>Chief Clinical Advisor:</b> Dr. Nixi Cat, DO — practicing physician with deep behavioral health expertise. "
    "<b>Infrastructure:</b> HIPAA-compliant Google Cloud Platform. "
    "<b>Model:</b> Trained on 952,358 SAMHSA patient episodes. Validated at 89.6% AUC-ROC."
)
story.append(Paragraph(team_txt, BODY))
story.append(hline())

# ─── OKLAHOMA PROUD / CTA ─────────────────────────────────────────────────
cta_box = Table(
    [[Paragraph("Help Us Make Oklahoma Proud in Silicon Valley", CTA_HEAD),
     ]],
    colWidths=[6.5*inch],
    style=TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), HexColor('#0C0C22')),
        ('BOX',           (0,0), (-1,-1), 1.5, MAGENTA),
        ('TOPPADDING',    (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING',   (0,0), (-1,-1), 20),
        ('RIGHTPADDING',  (0,0), (-1,-1), 20),
    ])
)
cta_body_box = Table(
    [[Paragraph(
        "CensusGuard is one of a select group of startups chosen to present at the "
        "<b>Venture Summit West</b> in Mountain View, California this June — on the same grounds as the Computer History Museum. "
        "We're bringing Oklahoma innovation to Silicon Valley, representing our state on the national stage.",
        ParagraphStyle('ctab2', fontName='Helvetica', fontSize=10.5, textColor=LIGHT,
                       alignment=TA_CENTER, leading=16, spaceAfter=0))]],
    colWidths=[6.5*inch],
    style=TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), HexColor('#0C0C22')),
        ('TOPPADDING',    (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
        ('LEFTPADDING',   (0,0), (-1,-1), 20),
        ('RIGHTPADDING',  (0,0), (-1,-1), 20),
        ('BOX',           (0,0), (-1,-1), 1.5, MAGENTA),
    ])
)
story.append(cta_box)
story.append(cta_body_box)
story.append(Spacer(1, 0.15*inch))

# Pilot interest callout
pilot_box = Table(
    [[Paragraph("INTERESTED IN A PILOT PARTNERSHIP?", SECTION_LABEL),
     ]],
    colWidths=[6.5*inch],
    style=TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), HexColor('#0F0F25')),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING',   (0,0), (-1,-1), 20),
        ('RIGHTPADDING',  (0,0), (-1,-1), 20),
    ])
)
pilot_body = Table(
    [[Paragraph(
        "We're actively seeking 2–3 behavioral health facilities for our inaugural pilot program. "
        "Pilot partners receive <b>complimentary access</b> during the initial phase in exchange for "
        "real-world validation and clinical feedback. Your facility's outcomes become part of our story.",
        ParagraphStyle('pb', fontName='Helvetica', fontSize=10, textColor=LIGHT,
                       alignment=TA_LEFT, leading=16))],
    [Spacer(1, 6)],
    [Table(
        [[Paragraph("Kourtney Rhodes, Founder & CEO", ParagraphStyle('contact', fontName='Helvetica-Bold', fontSize=10, textColor=WHITE, leading=14)),
          Paragraph("Kourtney@anchorpointhealthsystems.com", ParagraphStyle('contact', fontName='Helvetica', fontSize=10, textColor=CYAN, leading=14)),
          Paragraph("405-887-0165", ParagraphStyle('contact', fontName='Helvetica', fontSize=10, textColor=CYAN, leading=14)),
        ]],
        colWidths=[2.2*inch, 2.8*inch, 1.4*inch],
        style=TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ])
    )]],
    colWidths=[6.5*inch],
    style=TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), HexColor('#0F0F25')),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 14),
        ('LEFTPADDING',   (0,0), (-1,-1), 20),
        ('RIGHTPADDING',  (0,0), (-1,-1), 20),
        ('BOX',           (0,0), (-1,-1), 1.5, PURPLE),
        ('LINEBELOW',     (0,-1), (-1,-1), 2, MAGENTA),
    ])
)
story.append(pilot_box)
story.append(pilot_body)
story.append(Spacer(1, 0.12*inch))

# Footer
if os.path.exists(anchor_logo):
    try:
        aimg = Image(anchor_logo, width=1.6*inch, height=0.4*inch, kind='proportional')
        aimg.hAlign = 'CENTER'
        story.append(aimg)
        story.append(Spacer(1, 0.04*inch))
    except:
        pass

story.append(Paragraph(
    "AnchorPoint Health Systems LLC  ·  Moore, Oklahoma  ·  anchorpointhealthsystems.com",
    FOOTER_TXT))
story.append(Paragraph(
    "HIPAA Compliant  ·  Google Cloud Infrastructure  ·  Vertex AI AutoML  ·  Kipu EHR Integration",
    FOOTER_TXT))
story.append(Spacer(1, 0.08*inch))
story.append(HRFlowable(width='100%', thickness=0.4, color=CARDLINE, spaceAfter=0))

# ── Build PDF ───────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    leftMargin=MARGIN,
    rightMargin=MARGIN,
    topMargin=MARGIN,
    bottomMargin=MARGIN,
    title="CensusGuard — Clinical Brochure",
    author="AnchorPoint Health Systems",
)
doc.build(story, canvasmaker=BrandedCanvas)
print(f"✅ Done: {OUTPUT}")
