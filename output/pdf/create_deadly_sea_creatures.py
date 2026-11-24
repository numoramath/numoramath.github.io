from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, Frame
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from pathlib import Path

OUT = Path(__file__).with_name("deadly_sea_creatures_test.pdf")
W, H = letter
NAVY = HexColor("#082B49")
TEAL = HexColor("#0D7C86")
CORAL = HexColor("#F26B5E")
SAND = HexColor("#F5EFE3")
INK = HexColor("#193447")
MIST = HexColor("#D9EEF0")

styles = getSampleStyleSheet()
title = ParagraphStyle("title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=31, leading=35, textColor=white, alignment=TA_CENTER)
subtitle = ParagraphStyle("subtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=13, leading=18, textColor=HexColor("#D9EEF0"), alignment=TA_CENTER)
h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=23, leading=27, textColor=NAVY, spaceAfter=8)
h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=TEAL, spaceAfter=5)
body = ParagraphStyle("body", parent=styles["BodyText"], fontName="Helvetica", fontSize=10.5, leading=15, textColor=INK)
small = ParagraphStyle("small", parent=body, fontSize=8.5, leading=11, textColor=HexColor("#49606C"))
h2white = ParagraphStyle("h2white", parent=h2, textColor=white)
bodywhite = ParagraphStyle("bodywhite", parent=body, textColor=white)

def para(c, text, style, x, y, w, h):
    Frame(x, y, w, h, showBoundary=0).addFromList([Paragraph(text, style)], c)

def footer(c, page, label="DEADLY SEA CREATURES"):
    c.setStrokeColor(HexColor("#B9D5D8")); c.setLineWidth(.5)
    c.line(.65*inch, .48*inch, W-.65*inch, .48*inch)
    c.setFont("Helvetica", 8); c.setFillColor(HexColor("#5E737A"))
    c.drawString(.65*inch, .28*inch, label)
    c.drawRightString(W-.65*inch, .28*inch, str(page))

def bubble(c, x, y, r, color):
    c.setFillColor(color); c.setStrokeColor(color); c.circle(x, y, r, fill=1, stroke=0)

def wave(c, y, color):
    c.setStrokeColor(color); c.setLineWidth(2)
    p = c.beginPath(); p.moveTo(0, y)
    for x in range(0, int(W)+20, 40):
        p.curveTo(x+10, y+9, x+25, y+9, x+40, y)
    c.drawPath(p)

def creature_card(c, x, y, w, h, name, latin, threat, fact, accent, icon):
    c.setFillColor(white); c.setStrokeColor(HexColor("#C8DCDD")); c.roundRect(x, y, w, h, 12, fill=1, stroke=1)
    c.setFillColor(accent); c.roundRect(x, y+h-40, w, 40, 12, fill=1, stroke=0)
    c.rect(x, y+h-40, w, 20, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 16); c.drawString(x+14, y+h-26, name)
    c.setFillColor(INK); c.setFont("Helvetica-Oblique", 8.5); c.drawString(x+14, y+h-56, latin)
    c.setFillColor(MIST); c.circle(x+w-51, y+h-75, 30, fill=1, stroke=0)
    c.setFillColor(accent); c.setFont("Helvetica-Bold", 27); c.drawCentredString(x+w-51, y+h-85, icon)
    para(c, f"<b>Threat level:</b> {threat}", body, x+14, y+55, w-28, 28)
    para(c, fact, small, x+14, y+10, w-28, 48)

c = canvas.Canvas(str(OUT), pagesize=letter)

# Cover
c.setFillColor(NAVY); c.rect(0, 0, W, H, fill=1, stroke=0)
for bx, by, br in [(75,690,4),(520,650,5),(110,460,3),(470,250,4),(350,720,3),(240,120,4)]: bubble(c,bx,by,br,HexColor("#3B7781"))
c.setFillColor(TEAL); c.circle(W/2, 470, 138, fill=1, stroke=0)
c.setFillColor(NAVY); c.circle(W/2, 470, 118, fill=1, stroke=0)
wave(c, 405, HexColor("#6BC5C8")); wave(c, 392, HexColor("#2E8F97"))
para(c, "DEADLY SEA<br/>CREATURES", title, 80, 580, W-160, 100)
para(c, "A short, colorful field guide to animals that deserve respect in the water", subtitle, 105, 528, W-210, 45)
c.setFillColor(CORAL); c.roundRect(190, 83, 232, 38, 19, fill=1, stroke=0)
c.setFillColor(white); c.setFont("Helvetica-Bold", 11); c.drawCentredString(W/2, 97, "TEST EDITION  |  2026")
c.showPage()

# Intro
c.setFillColor(SAND); c.rect(0,0,W,H,fill=1,stroke=0); footer(c,2)
para(c, "Meet the ocean's caution signs", h1, .72*inch, 680, 6.1*inch, 45)
para(c, "The sea is full of remarkable animals. A few have venom, powerful jaws, or defensive spines that can seriously injure a person. This guide is about awareness - not fear.", body, .72*inch, 620, 6.1*inch, 60)
para(c, "Three smart rules", h2, .72*inch, 535, 6.1*inch, 38)
rules = [("1", "Give wildlife space", "Never touch, chase, corner, or feed a wild sea creature."), ("2", "Watch where you step", "Use a swim mask, wear water shoes when appropriate, and shuffle your feet in shallow sand."), ("3", "Get help quickly", "If someone is stung or bitten, leave the water, call local emergency services, and follow lifeguard guidance.")]
for i,(n,head,txt) in enumerate(rules):
    y=455-i*105
    c.setFillColor(TEAL); c.circle(.98*inch,y+23,19,fill=1,stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold",14); c.drawCentredString(.98*inch,y+18,n)
    para(c, head, h2, 1.42*inch, y+18, 4.8*inch, 28)
    para(c, txt, body, 1.42*inch, y-22, 4.85*inch, 42)
para(c, "Important: This is an educational test booklet, not medical advice. Local species and emergency procedures vary by region.", small, .72*inch, 95, 6.1*inch, 42)
c.showPage()

# Cards
c.setFillColor(HexColor("#F0F8F7")); c.rect(0,0,W,H,fill=1,stroke=0); footer(c,3)
para(c, "Four animals to know", h1, .72*inch, 694, 6.1*inch, 40)
para(c, "Their danger comes from different tools: venom, electricity, teeth, or stinging cells.", body, .72*inch, 650, 6.1*inch, 32)
cards=[
    ("Box jellyfish", "Chironex fleckeri", "Extreme", "Tentacles deliver venom that can cause intense pain and dangerous heart effects.", CORAL, "J"),
    ("Stonefish", "Synanceia spp.", "Very high", "Camouflaged among rocks, its dorsal spines are venomous. Don't step on it.", TEAL, "S"),
    ("Blue-ringed octopus", "Hapalochlaena spp.", "Very high", "Its venom can cause paralysis. Bright blue rings mean back away.", HexColor("#6A5ACD"), "O"),
    ("Great white shark", "Carcharodon carcharias", "High", "A powerful predator. Avoid provoking sharks and give all wildlife space.", NAVY, "W"),
]
for i, card in enumerate(cards):
    x=.72*inch+(i%2)*3.3*inch; y=3.55*inch-(i//2)*2.55*inch
    creature_card(c,x,y,2.95*inch,2.15*inch,*card)
c.showPage()

# Back page
c.setFillColor(NAVY); c.rect(0,0,W,H,fill=1,stroke=0); footer(c,4,"TEST EDITION")
para(c, "The ocean rewards curiosity", title, .72*inch, 635, 6.1*inch, 55)
para(c, "Most sea creatures want to avoid us. The safest encounter is one where the animal gets to keep its distance and you get to keep learning.", subtitle, .95*inch, 548, 5.65*inch, 70)
c.setFillColor(TEAL); c.roundRect(1.05*inch, 340, 5.4*inch, 110, 18, fill=1, stroke=0)
para(c, "Quick check", h2white, 1.35*inch, 408, 4.8*inch, 28)
para(c, "Can you name the four warning tools in this guide? Venom  |  Electricity  |  Teeth  |  Stinging cells", bodywhite, 1.35*inch, 350, 4.8*inch, 55)
para(c, "Created as a test PDF booklet", small, .72*inch, 85, 6.1*inch, 28)
c.save()
print(OUT)
