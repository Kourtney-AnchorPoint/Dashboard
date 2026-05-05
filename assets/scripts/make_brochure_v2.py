"""
CensusGuard Trifold Brochure — v2
Landscape letter, 3 equal panels (each 3.667" wide x 8.5" tall)
Front cover: Panel 3 (right)
Inside: Panels 4/5/6 (second page, left to right)
Back cover / inside fold: Panels 1/2 (left/center on front page)
"""

from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import Frame, BaseDocTemplate, PageTemplate
from PIL import Image as PILImage
import os

# ── Dimensions ────────────────────────────────────────────────────────────
PW, PH = landscape(letter)   # 11" x 8.5"  →  792 x 612 pt
PANEL_W = PW / 3             # ~264 pt each
PAD = 18                     # inner padding per panel

# ── Colors ────────────────────────────────────────────────────────────────
BG       = HexColor('#07070F')
MAGENTA  = HexColor('#D4159A')
PURPLE   = HexColor('#8844E8')
CYAN     = HexColor('#10D8F0')
WHITE    = HexColor('#FFFFFF')
LIGHT    = HexColor('#E0E0EE')
DIMGRAY  = HexColor('#8888A8')
DARKCARD = HexColor('#111125')
CARDLINE = HexColor('#28284A')

# ── Logo paths ────────────────────────────────────────────────────────────
LOGO_CG  = '/app/incoming_files/c3d5295ac_CensusGuard_banner_logo.png'
LOGO_AP  = '/app/incoming_files/3550831ed_AnchorPoint_Logo_Right_Final1.png'

# ── Styles ────────────────────────────────────────────────────────────────
def sty(name, font='Helvetica', size=9, color=LIGHT, align=TA_LEFT, bold=False, italic=False,
        leading=None, spaceBefore=0, spaceAfter=4, indent=0):
    fn = 'Helvetica-Bold' if bold else ('Helvetica-Oblique' if italic else font)
    return ParagraphStyle(name, fontName=fn, fontSize=size, textColor=color,
                          alignment=align, leading=leading or size*1.4,
                          spaceBefore=spaceBefore, spaceAfter=spaceAfter, leftIndent=indent)

# ── Canvas helpers ────────────────────────────────────────────────────────
def dark_page(c):
    c.saveState()
    c.setFillColor(BG)
    c.rect(0, 0, PW, PH, fill=1, stroke=0)
    c.restoreState()

def panel_dividers(c):
    c.saveState()
    c.setStrokeColor(HexColor('#1E1E38'))
    c.setDash(4, 4)
    c.setLineWidth(0.5)
    c.line(PANEL_W,   8, PANEL_W,   PH-8)
    c.line(PANEL_W*2, 8, PANEL_W*2, PH-8)
    c.restoreState()

def draw_logo(c, path, x, y, max_w, max_h):
    if not os.path.exists(path):
        return
    try:
        img = PILImage.open(path)
        iw, ih = img.size
        scale = min(max_w/iw, max_h/ih)
        w, h = iw*scale, ih*scale
        c.drawImage(path, x + (max_w-w)/2, y, width=w, height=h, mask='auto')
    except Exception as e:
        print(f"Logo error: {e}")

def accent_bar(c, x, y, w=None, color=MAGENTA, h=2):
    c.saveState()
    c.setFillColor(color)
    c.rect(x, y, w or PANEL_W - PAD*2, h, fill=1, stroke=0)
    c.restoreState()

def draw_text(c, text, x, y, font='Helvetica', size=9, color=WHITE, align='left', max_width=None):
    c.saveState()
    c.setFillColor(color)
    c.setFont(font, size)
    if align == 'center' and max_width:
        tw = c.stringWidth(text, font, size)
        x = x + (max_width - tw) / 2
    c.drawString(x, y, text)
    c.restoreState()

def wrapped_text(c, text, x, y, max_w, font='Helvetica', size=9, color=LIGHT, line_h=13):
    """Simple word-wrap text block. Returns final y position."""
    c.saveState()
    c.setFillColor(color)
    c.setFont(font, size)
    words = text.split()
    line = ''
    for word in words:
        test = (line + ' ' + word).strip()
        if c.stringWidth(test, font, size) <= max_w:
            line = test
        else:
            c.drawString(x, y, line)
            y -= line_h
            line = word
    if line:
        c.drawString(x, y, line)
        y -= line_h
    c.restoreState()
    return y

def card_box(c, x, y, w, h, bg=DARKCARD, border=CARDLINE, top_accent=None):
    c.saveState()
    c.setFillColor(bg)
    c.setStrokeColor(border)
    c.setLineWidth(0.6)
    c.roundRect(x, y, w, h, 4, fill=1, stroke=1)
    if top_accent:
        c.setFillColor(top_accent)
        c.rect(x, y+h-2, w, 2, fill=1, stroke=0)
    c.restoreState()

def stat_block(c, px, y, number, label, desc):
    """Draw a stat card inside a panel. px = panel left edge."""
    bw = PANEL_W - PAD*2
    bh = 58
    bx = px + PAD
    card_box(c, bx, y-bh, bw, bh, top_accent=MAGENTA)
    draw_text(c, number, bx, y-22, 'Helvetica-Bold', 18, MAGENTA, 'center', bw)
    draw_text(c, label,  bx, y-34, 'Helvetica-Bold', 7, CYAN, 'center', bw)
    wrapped_text(c, desc, bx+6, y-44, bw-12, 'Helvetica', 7.5, DIMGRAY, 11)
    return y - bh - 8

def feature_row(c, px, y, icon, title, desc):
    bw = PANEL_W - PAD*2
    bx = px + PAD
    bh = 44
    card_box(c, bx, y-bh, bw, bh, top_accent=PURPLE)
    draw_text(c, icon,  bx+8,    y-16, 'Helvetica-Bold', 13, CYAN)
    draw_text(c, title, bx+28,   y-15, 'Helvetica-Bold', 8.5, WHITE)
    wrapped_text(c, desc, bx+28, y-26, bw-36, 'Helvetica', 7.5, LIGHT, 11)
    return y - bh - 5

# ── PAGE 1: Outside of brochure (fold: right=cover, center=back, left=inside-back) ──
OUTPUT = '/app/CensusGuard_Brochure_v2.pdf'
c = pdfcanvas.Canvas(OUTPUT, pagesize=landscape(letter))

# --- Page 1 ---
dark_page(c)
panel_dividers(c)

# ═══════════════════════════════════════════════════════
# PANEL 3 (RIGHT) — FRONT COVER
# ═══════════════════════════════════════════════════════
px = PANEL_W * 2
pw = PANEL_W - PAD*2

# Top magenta gradient strip
c.saveState()
c.setFillColor(HexColor('#1A0830'))
c.rect(px, PH-120, PANEL_W, 120, fill=1, stroke=0)
c.restoreState()

# Logo
draw_logo(c, LOGO_CG, px, PH-85, PANEL_W, 65)

# Accent line
accent_bar(c, px+PAD, PH-95, color=MAGENTA)

# Tagline
draw_text(c, 'AI-POWERED EARLY WARNING SYSTEM', px, PH-112, 'Helvetica-Bold', 7.5, CYAN, 'center', PANEL_W)

# Hero statement
c.saveState()
c.setFillColor(WHITE)
c.setFont('Helvetica-Bold', 15)
lines = ['See the signs', 'before the shift.']
yy = PH - 148
for l in lines:
    tw = c.stringWidth(l, 'Helvetica-Bold', 15)
    c.drawString(px + (PANEL_W-tw)/2, yy, l)
    yy -= 20
c.restoreState()

# Sub
yy = wrapped_text(c, 'Real-time risk intelligence that tells your clinical team who\'s about to leave — and why — before it\'s too late.',
    px+PAD+4, yy-8, pw-8, 'Helvetica', 9, LIGHT, 13)

# Stats
accent_bar(c, px+PAD, yy-4, color=PURPLE)
yy -= 20
yy = stat_block(c, px, yy, '1 in 2', 'OKLAHOMA AMA RATE', 'SUD patients leave before completing treatment')
yy = stat_block(c, px, yy, '89.6%', 'AUC-ROC ACCURACY', 'Vertex AI validated on 952,358 patient records')
yy = stat_block(c, px, yy, '$200', 'PER BED / MONTH', 'Flat rate — no tiers, no surprises')

# Bottom
accent_bar(c, px+PAD, 28, color=MAGENTA)
draw_text(c, 'anchorpointhealthsystems.com', px, 14, 'Helvetica', 7.5, DIMGRAY, 'center', PANEL_W)

# ═══════════════════════════════════════════════════════
# PANEL 2 (CENTER) — BACK COVER
# ═══════════════════════════════════════════════════════
px = PANEL_W
pw = PANEL_W - PAD*2

c.saveState()
c.setFillColor(HexColor('#0C0820'))
c.rect(px, PH-80, PANEL_W, 80, fill=1, stroke=0)
c.restoreState()

draw_text(c, 'OUR STORY', px, PH-22, 'Helvetica-Bold', 8, CYAN, 'center', PANEL_W)
accent_bar(c, px+PAD, PH-30, color=MAGENTA)

draw_text(c, 'Built by someone who lived it.', px, PH-46, 'Helvetica-Bold', 11, WHITE, 'center', PANEL_W)

yy = PH - 64
yy = wrapped_text(c, 'AnchorPoint Health Systems was founded by Kourtney Rhodes — a behavioral health tech entrepreneur, AI product management certified professional (Duke University), and person with lived experience in addiction recovery.',
    px+PAD, yy, pw, 'Helvetica', 8.5, LIGHT, 13)

# Quote box
yy -= 8
qh = 68
card_box(c, px+PAD, yy-qh, pw, qh, bg=HexColor('#12082A'), border=PURPLE, top_accent=MAGENTA)
c.saveState()
c.setFillColor(MAGENTA)
c.setFont('Helvetica-Bold', 18)
c.drawString(px+PAD+6, yy-14, '\u201c')
c.restoreState()
wrapped_text(c, 'I built this company because the system that was supposed to save my life almost killed me. Now I\'m using AI to make sure nobody else falls through the cracks.',
    px+PAD+14, yy-18, pw-22, 'Helvetica-Oblique', 8, LIGHT, 12)
draw_text(c, '— Kourtney Rhodes, Founder & CEO', px+PAD+14, yy-qh+8, 'Helvetica-Bold', 7.5, MAGENTA)
yy -= qh + 10

yy = wrapped_text(c, 'Chief Clinical Advisor: Dr. Nixi Cat, DO. Infrastructure: HIPAA-Compliant Google Cloud Platform. Model trained on 952,358 SAMHSA patient episodes.',
    px+PAD, yy, pw, 'Helvetica', 8, DIMGRAY, 12)

# Oklahoma proud box
yy -= 8
oh = 72
card_box(c, px+PAD, yy-oh, pw, oh, bg=HexColor('#0C0C22'), border=MAGENTA)
draw_text(c, 'Help Us Make Oklahoma', px, yy-14, 'Helvetica-Bold', 9.5, WHITE, 'center', PANEL_W)
draw_text(c, 'Proud in Silicon Valley', px, yy-26, 'Helvetica-Bold', 9.5, MAGENTA, 'center', PANEL_W)
wrapped_text(c, 'Selected for Venture Summit West — Seed Track. June 16-17, Computer History Museum, Mountain View, CA.',
    px+PAD+6, yy-40, pw-12, 'Helvetica', 8, LIGHT, 12)
yy -= oh + 10

# Contact
accent_bar(c, px+PAD, yy, color=PURPLE)
yy -= 16
draw_text(c, 'Kourtney Rhodes, Founder & CEO', px, yy, 'Helvetica-Bold', 8, WHITE, 'center', PANEL_W)
yy -= 13
draw_text(c, 'Kourtney@anchorpointhealthsystems.com', px, yy, 'Helvetica', 7.5, CYAN, 'center', PANEL_W)
yy -= 13
draw_text(c, '405-887-0165', px, yy, 'Helvetica', 7.5, CYAN, 'center', PANEL_W)

# AnchorPoint logo bottom
draw_logo(c, LOGO_AP, px, 10, PANEL_W, 30)

# ═══════════════════════════════════════════════════════
# PANEL 1 (LEFT) — INSIDE BACK / PILOT CTA
# ═══════════════════════════════════════════════════════
px = 0
pw = PANEL_W - PAD*2

c.saveState()
c.setFillColor(HexColor('#0C0820'))
c.rect(0, PH-70, PANEL_W, 70, fill=1, stroke=0)
c.restoreState()

draw_text(c, 'READY TO PROTECT YOUR CENSUS?', px, PH-20, 'Helvetica-Bold', 8, CYAN, 'center', PANEL_W)
accent_bar(c, px+PAD, PH-30, color=MAGENTA)
draw_text(c, 'Join Our Pilot Program', px, PH-46, 'Helvetica-Bold', 13, WHITE, 'center', PANEL_W)

yy = PH - 66
yy = wrapped_text(c, 'We are actively onboarding behavioral health facilities for our 60-day pilot program. No long-term contract required. Just results.',
    px+PAD, yy, pw, 'Helvetica', 8.5, LIGHT, 13)

yy -= 8
# What you get
draw_text(c, 'PILOT PARTNERS RECEIVE:', px+PAD, yy, 'Helvetica-Bold', 8, CYAN)
yy -= 14
benefits = [
    ('✓', 'Dedicated onboarding & clinical training'),
    ('✓', 'Direct line to founding team'),
    ('✓', 'No long-term contract — 60 days, then decide'),
    ('✓', 'Co-authorship on outcomes data publication'),
    ('✓', 'Priority partnership status at general availability'),
]
for icon, text in benefits:
    c.saveState()
    c.setFillColor(MAGENTA)
    c.setFont('Helvetica-Bold', 9)
    c.drawString(px+PAD, yy, icon)
    c.restoreState()
    draw_text(c, text, px+PAD+14, yy, 'Helvetica', 8.5, LIGHT)
    yy -= 13

yy -= 6
accent_bar(c, px+PAD, yy, color=PURPLE)
yy -= 16

# Pricing box
ph2 = 52
card_box(c, px+PAD, yy-ph2, pw, ph2, bg=HexColor('#0F0F25'), border=MAGENTA, top_accent=MAGENTA)
draw_text(c, 'PILOT PRICING', px, yy-13, 'Helvetica-Bold', 7.5, CYAN, 'center', PANEL_W)
draw_text(c, '$200 per bed / month', px, yy-26, 'Helvetica-Bold', 14, WHITE, 'center', PANEL_W)
draw_text(c, 'Flat rate. No tiers. No surprises.', px, yy-39, 'Helvetica', 8, DIMGRAY, 'center', PANEL_W)
yy -= ph2 + 10

# HIPAA badges
badges = ['HIPAA Compliant', 'Google Cloud', 'Kipu EHR Integration', 'Vertex AI']
bw2 = (pw - 6) / 2
for i, b in enumerate(badges):
    bx2 = px + PAD + (i%2) * (bw2+6)
    by2 = yy - (i//2)*22
    card_box(c, bx2, by2-16, bw2, 16, bg=HexColor('#0A0A1E'), border=PURPLE)
    draw_text(c, b, bx2, by2-11, 'Helvetica-Bold', 6.5, CYAN, 'center', bw2)
yy -= 52

accent_bar(c, px+PAD, 28, color=PURPLE)
draw_text(c, 'anchorpointhealthsystems.com  ·  405-887-0165', px, 14, 'Helvetica', 7, DIMGRAY, 'center', PANEL_W)

c.showPage()

# ═══════════════════════════════════════════════════════
# PAGE 2 — INSIDE (open brochure, left to right)
# ═══════════════════════════════════════════════════════
dark_page(c)
panel_dividers(c)

# Magenta top bar across all 3 panels
c.saveState()
c.setFillColor(HexColor('#0D0826'))
c.rect(0, PH-36, PW, 36, fill=1, stroke=0)
c.setFillColor(MAGENTA)
c.rect(0, PH-38, PW, 2, fill=1, stroke=0)
c.restoreState()
draw_text(c, 'THE PROBLEM', 0, PH-14, 'Helvetica-Bold', 7, CYAN, 'center', PANEL_W)
draw_text(c, 'THE SOLUTION', PANEL_W, PH-14, 'Helvetica-Bold', 7, CYAN, 'center', PANEL_W)
draw_text(c, 'THE ROI', PANEL_W*2, PH-14, 'Helvetica-Bold', 7, CYAN, 'center', PANEL_W)
draw_text(c, 'CensusGuard', 0, PH-27, 'Helvetica-Bold', 8.5, DIMGRAY, 'center', PANEL_W)
draw_text(c, 'CensusGuard', PANEL_W, PH-27, 'Helvetica-Bold', 8.5, DIMGRAY, 'center', PANEL_W)
draw_text(c, 'CensusGuard', PANEL_W*2, PH-27, 'Helvetica-Bold', 8.5, DIMGRAY, 'center', PANEL_W)

# ═══════════════════════════════════════════════════════
# INSIDE PANEL 1 — THE PROBLEM
# ═══════════════════════════════════════════════════════
px = 0
pw = PANEL_W - PAD*2

draw_text(c, 'Patients are leaving.', px, PH-54, 'Helvetica-Bold', 12, WHITE, 'center', PANEL_W)
draw_text(c, 'The warning signs are invisible.', px, PH-68, 'Helvetica-Bold', 9, MAGENTA, 'center', PANEL_W)
accent_bar(c, px+PAD, PH-76, color=PURPLE)

yy = PH - 92
yy = wrapped_text(c, 'Every day, patients walk out of addiction treatment before it\'s over. Staff don\'t see it coming — not because they don\'t care, but because the warning signs are buried in data no one has time to read.',
    px+PAD, yy, pw, 'Helvetica', 8.5, LIGHT, 13)

yy -= 8
yy = stat_block(c, px, yy, '1 in 3', 'NATIONALLY', 'SUD patients leave before completing treatment (AMA)')
yy = stat_block(c, px, yy, '49.9%', 'OKLAHOMA AMA RATE', '46% above the national average of 34.1%')
yy = stat_block(c, px, yy, '$150K+', 'LOST PER MONTH', 'Per 30-bed facility from AMA discharges')

yy -= 4
accent_bar(c, px+PAD, yy, color=MAGENTA)
yy -= 14
yy = wrapped_text(c, 'The data to solve this has always existed. Nobody built the bridge. Until now.',
    px+PAD, yy, pw, 'Helvetica-Oblique', 8.5, LIGHT, 13)

# How it works — 4 steps
yy -= 8
draw_text(c, 'HOW IT WORKS', px+PAD, yy, 'Helvetica-Bold', 7.5, CYAN)
yy -= 14
steps = [('01','Connect','Plug into your existing EHR — no new hardware.'),
         ('02','Score','Built to rescore every patient in real time once connected to your EHR data.'),
         ('03','Alert','Clinical staff get instant alerts with exact risk drivers.'),
         ('04','Act','Document interventions. Track outcomes. Prove impact.')]
for num, title, desc in steps:
    c.saveState()
    c.setFillColor(MAGENTA)
    c.setFont('Helvetica-Bold', 10)
    c.drawString(px+PAD, yy, num)
    c.restoreState()
    draw_text(c, title, px+PAD+22, yy, 'Helvetica-Bold', 8.5, WHITE)
    yy -= 12
    wrapped_text(c, desc, px+PAD+22, yy, pw-22, 'Helvetica', 7.5, DIMGRAY, 11)
    yy -= 14

# ═══════════════════════════════════════════════════════
# INSIDE PANEL 2 — THE SOLUTION
# ═══════════════════════════════════════════════════════
px = PANEL_W
pw = PANEL_W - PAD*2

draw_text(c, 'CensusGuard is an AI-powered', px, PH-54, 'Helvetica-Bold', 10, WHITE, 'center', PANEL_W)
draw_text(c, 'early warning system.', px, PH-66, 'Helvetica-Bold', 10, WHITE, 'center', PANEL_W)
accent_bar(c, px+PAD, PH-76, color=PURPLE)

yy = PH - 90
yy = wrapped_text(c, 'CensusGuard plugs directly into your existing EHR data — no new hardware, no wearables, no workflow disruption. Our model was trained on nearly 1 million patient records and validated at 89.6% AUC-ROC accuracy.',
    px+PAD, yy, pw, 'Helvetica', 8.5, LIGHT, 13)

yy -= 8
draw_text(c, 'KEY FEATURES', px+PAD, yy, 'Helvetica-Bold', 7.5, CYAN)
yy -= 10

features = [
    ('⚡', 'Real-Time Risk Scoring', 'Built to deliver dynamic 0-100 risk scores in real time once connected to your EHR data.'),
    ('🎯', 'Predictive Risk Tiers', 'LOW / MODERATE / HIGH / CRITICAL with exact clinical drivers.'),
    ('📊', 'Day-1 Admission Intel', 'Scored from intake data alone — 89.6% AUC-ROC accuracy.'),
    ('🔔', 'Instant Alerts', 'Clinical alerts fire the moment risk escalates — with context.'),
    ('👥', 'Group Cohesion', 'Track unit-level energy and social dynamics as data flows in.'),
    ('🔗', 'EHR Integration', 'Kipu EHR + major BH platforms. HIPAA Compliant. GCP.'),
]
for icon, title, desc in features:
    yy = feature_row(c, px, yy, icon, title, desc)

yy -= 4
accent_bar(c, px+PAD, yy, color=MAGENTA)
yy -= 14
draw_text(c, 'WHAT MAKES US DIFFERENT', px+PAD, yy, 'Helvetica-Bold', 7.5, CYAN)
yy -= 13
diffs = ['No wearables or new hardware required',
         'Works with data you already collect',
         'Real-time — not nightly batch predictions',
         'Built by someone with lived recovery experience']
for d in diffs:
    c.saveState()
    c.setFillColor(MAGENTA)
    c.setFont('Helvetica-Bold', 8)
    c.drawString(px+PAD, yy, '›')
    c.restoreState()
    draw_text(c, d, px+PAD+10, yy, 'Helvetica', 8, LIGHT)
    yy -= 12

# ═══════════════════════════════════════════════════════
# INSIDE PANEL 3 — THE ROI
# ═══════════════════════════════════════════════════════
px = PANEL_W * 2
pw = PANEL_W - PAD*2

draw_text(c, 'Protect your census.', px, PH-54, 'Helvetica-Bold', 11, WHITE, 'center', PANEL_W)
draw_text(c, 'Protect your revenue.', px, PH-67, 'Helvetica-Bold', 11, MAGENTA, 'center', PANEL_W)
accent_bar(c, px+PAD, PH-77, color=PURPLE)

yy = PH - 93
yy = wrapped_text(c, 'At $200 per bed per month — flat rate, no tiers — CensusGuard is the easiest line item to justify. One prevented AMA discharge pays for months of access.',
    px+PAD, yy, pw, 'Helvetica', 8.5, LIGHT, 13)

# Pricing highlight
yy -= 6
ph3 = 38
card_box(c, px+PAD, yy-ph3, pw, ph3, bg=HexColor('#14082A'), border=MAGENTA, top_accent=MAGENTA)
draw_text(c, '$200 per bed / month', px, yy-15, 'Helvetica-Bold', 13, WHITE, 'center', PANEL_W)
draw_text(c, '60-day pilot. No long-term contract required.', px, yy-28, 'Helvetica', 7.5, DIMGRAY, 'center', PANEL_W)
yy -= ph3 + 10

# ROI table
draw_text(c, 'FACILITY', px+PAD, yy, 'Helvetica-Bold', 6.5, CYAN)
draw_text(c, 'MO. COST', px+PAD+70, yy, 'Helvetica-Bold', 6.5, CYAN)
draw_text(c, 'RECOVERED*', px+PAD+118, yy, 'Helvetica-Bold', 6.5, CYAN)
draw_text(c, 'ROI', px+PAD+190, yy, 'Helvetica-Bold', 6.5, CYAN)
yy -= 4
accent_bar(c, px+PAD, yy, pw, PURPLE, 0.5)
yy -= 10

rows = [
    ('30 beds',  '$6K/mo',  '$60K-90K',  '9-12x'),
    ('75 beds',  '$15K/mo', '$150K-200K','10-13x'),
    ('200 beds', '$40K/mo', '$500K+',    '12x+'),
]
for i, (fac, cost, rev, roi) in enumerate(rows):
    if i % 2 == 0:
        c.saveState()
        c.setFillColor(HexColor('#0E0E22'))
        c.rect(px+PAD, yy-11, pw, 14, fill=1, stroke=0)
        c.restoreState()
    draw_text(c, fac,  px+PAD,     yy, 'Helvetica', 8, LIGHT)
    draw_text(c, cost, px+PAD+70,  yy, 'Helvetica', 8, WHITE)
    draw_text(c, rev,  px+PAD+118, yy, 'Helvetica', 8, WHITE)
    draw_text(c, roi,  px+PAD+190, yy, 'Helvetica-Bold', 8, MAGENTA)
    yy -= 16

draw_text(c, '*Avg $15K/stay, 4+ additional completions/month', px+PAD, yy, 'Helvetica-Oblique', 6.5, DIMGRAY)
yy -= 16
accent_bar(c, px+PAD, yy, color=MAGENTA)
yy -= 14

# CTA
draw_text(c, 'REQUEST A PILOT', px, yy, 'Helvetica-Bold', 9, WHITE, 'center', PANEL_W)
yy -= 14

contact_items = [
    'Kourtney Rhodes, Founder & CEO',
    'Kourtney@anchorpointhealthsystems.com',
    '405-887-0165',
    'anchorpointhealthsystems.com',
]
for item in contact_items:
    col = CYAN if '@' in item or '.' in item and 'Rhodes' not in item else WHITE if 'Rhodes' in item else LIGHT
    draw_text(c, item, px, yy, 'Helvetica', 8, col, 'center', PANEL_W)
    yy -= 12

yy -= 4
# Trust badges row
badges2 = ['HIPAA Compliant', 'Vertex AI', 'Google Cloud', 'Kipu EHR']
bw3 = (pw-6)/2
for i, b in enumerate(badges2):
    bx3 = px+PAD + (i%2)*(bw3+6)
    by3 = yy - (i//2)*20
    card_box(c, bx3, by3-14, bw3, 14, bg=HexColor('#0A0A1E'), border=PURPLE)
    draw_text(c, b, bx3, by3-10, 'Helvetica-Bold', 6, CYAN, 'center', bw3)
yy -= 46

draw_logo(c, LOGO_AP, px, 8, PANEL_W, 28)

c.save()
print(f"✅ Trifold brochure saved: {OUTPUT}")
