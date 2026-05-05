"""
Clickable version of pitch deck — adds internal navigation links
"""
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas as pdfcanvas
from PyPDF2 import PdfReader, PdfWriter
import subprocess, os

# Just add bookmarks/links to existing PDF using reportlab annotations
# For simplicity: rebuild with clickable slide numbers in footer
# Re-use same script but add link annotations

OUTPUT_SRC = '/app/CensusGuard_PitchDeck_Summit2026.pdf'
OUTPUT_CLICK = '/app/CensusGuard_PitchDeck_Summit2026_Clickable.pdf'

try:
    reader = PdfReader(OUTPUT_SRC)
    writer = PdfWriter()
    total = len(reader.pages)
    
    for i, page in enumerate(reader.pages):
        writer.add_page(page)
        # Add named destination for each page
        writer.add_named_destination(f'slide_{i+1}', i)

    # Add outline/bookmarks
    slide_names = [
        'Cover — See the Signs Before the Shift',
        'The Problem — The Human Cost',
        'Founder Story — Built by Someone Who Lived It',
        'The Solution — CensusGuard',
        'Traction — We\'re Not Starting from Zero',
        'Market & Business Model',
        'The Ask — $500K SAFE',
        'Closing — Change the Outcome',
    ]
    for i, name in enumerate(slide_names):
        writer.add_outline_item(name, i)

    with open(OUTPUT_CLICK, 'wb') as f:
        writer.write(f)
    print(f"✅ Clickable deck saved: {OUTPUT_CLICK}")
except Exception as e:
    print(f"PyPDF2 error: {e} — trying install")
    subprocess.run(['pip', 'install', 'PyPDF2', '-q'])
