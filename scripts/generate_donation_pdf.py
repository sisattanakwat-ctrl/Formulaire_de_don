#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur de PDF de reçu de don pour la pagode
Format A4, informations du donateur sans les boutons/statistiques
Design amélioré avec cadres, couleurs harmonisées et support lao
"""

import sys
import json
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase.pdfmetrics import registerFontFamily, registerFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Image

# Enregistrer les polices
registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
registerFont(TTFont('NotoSansLao', '/home/z/my-project/scripts/NotoSansLao-Regular.ttf'))

# Enregistrer les familles de polices
registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('NotoSansLao', normal='NotoSansLao', bold='NotoSansLao')

# Configuration de la page A4
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 1.2 * cm  # Marges réduites pour plus de contenu

# Couleurs du thème (ambre harmonisé)
COLORS = {
    'primary': colors.HexColor('#b45309'),      # Orange foncé principal
    'primary_light': colors.HexColor('#ffedd5'),  # Orange très clair
    'amber': colors.HexColor('#f59e0b'),        # Orange ambre
    'amber_light': colors.HexColor('#fef3c7'),  # Orange clair
    'border': colors.HexColor('#92400e'),         # Bordure orange très foncé
    'text': colors.black,
    'white': colors.white,
    'text_gray': colors.HexColor('#6b7280')
}

# Styles
styles = getSampleStyleSheet()

# Titre principal
title_style = ParagraphStyle(
    'Title',
    parent=styles['Heading1'],
    fontName='DejaVuSerif',
    fontSize=18,
    textColor=COLORS['primary'],
    alignment=TA_CENTER,
    spaceAfter=0.2 * cm,
    leading=22
)

# Style de sous-titre
subtitle_style = ParagraphStyle(
    'Subtitle',
    parent=styles['Heading2'],
    fontName='NotoSansLao',
    fontSize=12,
    textColor=COLORS['primary'],
    alignment=TA_CENTER,
    spaceAfter=0.1 * cm,
    leading=15
)

# Style de section
section_style = ParagraphStyle(
    'Section',
    fontName='DejaVuSerif',
    fontSize=11,
    textColor=COLORS['primary'],
    bold=True,
    spaceBefore=0.15 * cm,
    spaceAfter=0.1 * cm,
    leading=14
)

# Style de corps de texte
body_style = ParagraphStyle(
    'Body',
    fontName='DejaVuSerif',
    fontSize=9,
    textColor=COLORS['text'],
    spaceAfter=0.1 * cm,
    leading=11
)

# Style de label
label_style = ParagraphStyle(
    'Label',
    fontName='DejaVuSerif',
    fontSize=9,
    textColor=COLORS['text_gray'],
    bold=True
)

# Style de label avec support lao
label_lao_style = ParagraphStyle(
    'LabelLao',
    fontName='NotoSansLao',
    fontSize=9,
    textColor=COLORS['text_gray'],
    bold=True
)

# Style de valeur
value_style = ParagraphStyle(
    'Value',
    fontName='DejaVuSerif',
    fontSize=9,
    textColor=COLORS['text'],
    leading=11
)

# Style de montant total
total_style = ParagraphStyle(
    'Total',
    fontName='DejaVuSerif',
    fontSize=16,
    textColor=COLORS['primary'],
    bold=True,
    alignment=TA_RIGHT,
    leading=20
)

# Style de pied de page
footer_style = ParagraphStyle(
    'Footer',
    fontName='DejaVuSerif',
    fontSize=8,
    textColor=COLORS['text_gray'],
    alignment=TA_CENTER,
    leading=10
)

# Style de pied de page lao
footer_lao_style = ParagraphStyle(
    'FooterLao',
    fontName='NotoSansLao',
    fontSize=8,
    textColor=COLORS['text_gray'],
    alignment=TA_CENTER,
    leading=10
)

# Style d'entête de tableau
table_header_style = ParagraphStyle(
    'TableHeader',
    fontName='DejaVuSerif',
    fontSize=9,
    textColor=COLORS['white'],
    bold=True,
    alignment=TA_CENTER,
    leading=11
)

# Style de cellule centrée
cell_center_style = ParagraphStyle(
    'CellCenter',
    fontName='DejaVuSerif',
    fontSize=9,
    textColor=COLORS['text'],
    alignment=TA_CENTER,
    leading=11,
    wordWrap='CJK'
)

# Style de cellule droite
cell_right_style = ParagraphStyle(
    'CellRight',
    fontName='DejaVuSerif',
    fontSize=9,
    textColor=COLORS['text'],
    alignment=TA_RIGHT,
    leading=11
)

# Style de remerciement
thank_you_style = ParagraphStyle(
    'ThankYou',
    fontName='DejaVuSerif',
    fontSize=10,
    textColor=COLORS['primary'],
    italic=True,
    alignment=TA_CENTER,
    spaceAfter=0.2 * cm,
    leading=13
)

# Style de texte lao
lao_style = ParagraphStyle(
    'Lao',
    fontName='NotoSansLao',
    fontSize=9,
    textColor=COLORS['text'],
    alignment=TA_CENTER,
    leading=11,
    wordWrap='CJK'
)


def format_currency(amount: float) -> str:
    """Formater un montant en euros"""
    return f"{amount:.2f} €"


def get_festival_translation(festival_name: str) -> str:
    """Obtenir la traduction laotienne d'une fête"""
    translations = {
        'Boun Makha bouxa': 'ບຸນມາກະບູຊາ',
        'Boun Nouvel an Lao': 'ບຸນປີໃຫມ່',
        'Boun Visakha bouxa': 'ບຸນວິສາຂະບູຊາ',
        'Boun Khao Phansa': 'ບຸນເຂົ້າພັນສາ',
        'Boun Khoun Khao': 'ບຸນຂຸນເຂົ້າ',
        'Boun Hork Khao Salak': 'ບຸນເຂົ້າສະລັກ',
        'Boun Ok Phansa': 'ບຸນອົກພັນສາ',
        'Boun Kathina': 'ບຸນກະຖິນ',
        'Boun Makhaboucha': 'ບຸນມາກະບູຊາ',
        'Boun Pi Mai': 'ບຸນປີໃຫມ່',
        'Boun Khao Salak': 'ບຸນເຂົ້າສະລັກ',
        'Boun That Luang': 'ບຸນທາດຫຼວງ',
        'Boun Visakhaboucha': 'ບຸນວິສາຂະບູຊາ',
        'Boun Asalhapoucha': 'ບຸນອາສາລະພູຊາ',
        'Boun Souang Heua': 'ບຸນຊ່ວງເຮືອ',
    }
    return translations.get(festival_name, festival_name)


def create_donor_info_section(data: dict) -> Table:
    """Créer le tableau des informations du donateur avec cadre"""
    donor_data = [
        [Paragraph('Civilité:', label_style), Paragraph(data.get('civility', ''), value_style)],
        [Paragraph('Nom:', label_style), Paragraph(data.get('lastName', ''), value_style)],
        [Paragraph('Prénom:', label_style), Paragraph(data.get('firstName', ''), value_style)],
        [Paragraph('Adresse:', label_style), Paragraph(data.get('address', ''), value_style)],
        [
            Paragraph('Code postal, Commune:', label_style),
            Paragraph(f"{data.get('postalCode', '')} {data.get('commune', '')}", value_style)
        ],
        [Paragraph('Email:', label_style), Paragraph(data.get('email', ''), value_style)],
        [Paragraph('Téléphone:', label_style), Paragraph(data.get('phone', ''), value_style)],
    ]

    table = Table(donor_data, colWidths=[3.5 * cm, 12.5 * cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['amber_light']),
        ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))

    return table


def create_donation_details_table(data: dict) -> Table:
    """Créer le tableau des détails du don avec cadre"""
    # Calculer les montants
    don_du_jour = float(data.get('donDuJourAmount', 0) or 0)
    plateau_celeste = float(data.get('plateauCelesteAmount', 0) or 0)
    effets_usuels = float(data.get('effetsUsuelsAmount', 0) or 0)
    entretien = float(data.get('entretienAmount', 0) or 0)
    
    # Données du tableau
    table_data = [
        [
            Paragraph('<b>Catégorie</b>', table_header_style),
            Paragraph('<b>Description</b>', table_header_style),
            Paragraph('<b>Montant</b>', table_header_style)
        ]
    ]
    
    # Ajouter les catégories avec montants > 0
    if don_du_jour > 0:
        table_data.extend([
            [
                Paragraph('Dons du jour', cell_center_style),
                Paragraph('ການບໍລິຈາກປະຈຳວັນ', lao_style),
                Paragraph(format_currency(don_du_jour), cell_right_style)
            ]
        ])

    if plateau_celeste > 0:
        table_data.extend([
            [
                Paragraph('Plateau céleste', cell_center_style),
                Paragraph('ຈານຂວາງຟ້າ', lao_style),
                Paragraph(format_currency(plateau_celeste), cell_right_style)
            ]
        ])

    if effets_usuels > 0:
        table_data.extend([
            [
                Paragraph('Effets usuels des moines', cell_center_style),
                Paragraph('ສິ່ງຂອງພຣະສົງ', lao_style),
                Paragraph(format_currency(effets_usuels), cell_right_style)
            ]
        ])

    if entretien > 0:
        table_data.extend([
            [
                Paragraph('Entretien de la pagode', cell_center_style),
                Paragraph('ການບຳລຸງຮັກສາວັດ', lao_style),
                Paragraph(format_currency(entretien), cell_right_style)
            ]
        ])
    
    table = Table(table_data, colWidths=[6 * cm, 6 * cm, 4 * cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLORS['amber']),  # En-tête en orange
        ('BACKGROUND', (0, 1), (-1, -1), COLORS['white']),  # Données en blanc
        ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    return table


def create_deceased_section(data: dict) -> list:
    """Créer la section des défunts si présents"""
    elements = []
    
    deceased_names = []
    for i in range(1, 5):
        name = data.get(f'deceasedName{i}', '')
        if name and name.strip():
            deceased_names.append(name)
    
    if deceased_names:
        elements.append(Paragraph('Dédicaces', section_style))
        elements.append(Paragraph(
            'Pour dédier aux ancêtres et parents défunts dont les noms ci-dessous :',
            body_style
        ))
        
        # Créer une liste numérotée
        for idx, name in enumerate(deceased_names, 1):
            elements.append(Paragraph(
                f'<b>Défunt {idx}:</b> {name}',
                body_style
            ))
        
        elements.append(Spacer(1, 0.2 * cm))
    
    return elements


def generate_pdf(input_json: str, output_file: str = None):
    """Générer le PDF du reçu de don"""
    
    # Charger les données
    try:
        data = json.loads(input_json)
    except json.JSONDecodeError as e:
        print(f"Erreur de parsing JSON: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Créer le document
    filename = output_file or 'donation_receipt.pdf'
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title='Reçu de Don',
        author='Z.ai',
        creator='Z.ai',
        subject='Reçu de don pour la pagode'
    )
    
    story = []
    
    # ==========================================
    # IMAGE D'ENTÊTE
    # ==========================================
    story.append(Spacer(1, 0.05 * cm))

    # Charger l'image de l'en-tête
    header_image_path = '/home/z/my-project/scripts/header_image_tiny.jpg'
    if os.path.exists(header_image_path):
        try:
            # Image miniature pour tenir sur une seule page
            header_image = Image(header_image_path, width=PAGE_WIDTH - 3 * cm)
            header_image.hAlign = 'CENTER'
            story.append(header_image)
        except Exception as e:
            print(f"Warning: Could not load header image: {e}", file=sys.stderr)

    story.append(Spacer(1, 0.05 * cm))

    # Titre "REÇU DE DON"
    story.append(Paragraph('REÇU DE DON', title_style))
    story.append(Spacer(1, 0.08 * cm))
    
    # Informations générales
    festival = data.get('festivalName', '')
    festival_lao = get_festival_translation(festival)
    payment_method = data.get('paymentMethod', '')
    donation_date = data.get('donationDate', datetime.now().isoformat())

    try:
        date_obj = datetime.fromisoformat(donation_date.replace('Z', '+00:00'))
        formatted_date = f"{date_obj.strftime('%d/%m/%Y')} à {date_obj.strftime('%H:%M')}"
    except:
        try:
            date_obj = datetime.fromisoformat(donation_date)
            formatted_date = f"{date_obj.strftime('%d/%m/%Y')} à {date_obj.strftime('%H:%M')}"
        except:
            formatted_date = str(donation_date)

    # Créer une table imbriquée pour le festival avec deux polices différentes
    festival_table_data = [
        [Paragraph(festival, value_style), Paragraph(festival_lao, lao_style)]
    ]
    festival_table = Table(festival_table_data, colWidths=[5.25 * cm, 5.25 * cm])
    festival_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))

    general_info_data = [
        [
            Paragraph('Fête:', label_style),
            Paragraph('ງານບຸນ:', footer_lao_style),
            festival_table
        ],
        [
            Paragraph('Mode de paiement:', label_style),
            Paragraph('ວິທີການ:', footer_lao_style),
            Paragraph('Espèces' if payment_method == 'cash' else 'Chèque', value_style)
        ],
        [
            Paragraph('Date et heure:', label_style),
            Paragraph('ວັນທີເວລາ:', footer_lao_style),
            Paragraph(formatted_date, value_style)
        ],
    ]

    general_info_table = Table(general_info_data, colWidths=[3.5 * cm, 3 * cm, 9.5 * cm])
    general_info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['amber_light']),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))

    story.append(general_info_table)
    story.append(Spacer(1, 0.15 * cm))

    # Informations du donateur
    story.append(Paragraph('Informations du Donateur', section_style))
    story.append(create_donor_info_section(data))
    story.append(Spacer(1, 0.15 * cm))

    # Détails du don
    story.append(Paragraph('Détails du Don', section_style))
    story.append(create_donation_details_table(data))
    story.append(Spacer(1, 0.15 * cm))
    
    # Dédicaces (si présentes)
    deceased_elements = create_deceased_section(data)
    if deceased_elements:
        story.extend(deceased_elements)
    
    # Total sur une seule ligne
    total_amount = data.get('totalAmount', 0)

    # Cadre compact pour le total
    total_box = Table(
        [
            [
                Paragraph('TOTAL DU DON', section_style),
                Paragraph(f'{format_currency(total_amount)}', total_style)
            ]
        ],
        colWidths=[6 * cm, PAGE_WIDTH - 9 * cm],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), COLORS['amber_light']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 1, COLORS['border']),
        ])
    )
    story.append(Spacer(1, 0.08 * cm))
    story.append(total_box)
    story.append(Spacer(1, 0.12 * cm))

    # Message de remerciement
    story.append(Paragraph(
        'Nous vous remercions sincèrement pour votre générosité et votre soutien à la pagode.',
        thank_you_style
    ))
    story.append(Spacer(1, 0.2 * cm))

    # Pied de page compact centré
    story.append(Paragraph(
        'Pagode Wat Sisattanak • ວັດສິສັດຕະນັກ',
        footer_lao_style
    ))
    story.append(Spacer(1, 0.05 * cm))
    story.append(Paragraph(
        f'Reçu généré le {datetime.now().strftime("%d/%m/%Y à %H:%M")}',
        footer_lao_style
    ))
    
    # Générer le PDF
    doc.build(story)

    # Retourner le fichier sur stdout
    with open(filename, 'rb') as f:
        sys.stdout.buffer.write(f.read())

    # Nettoyer le fichier temporaire
    if output_file and os.path.exists(output_file):
        os.remove(output_file)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_data = sys.argv[1]
        generate_pdf(input_data, 'temp_receipt.pdf')
    else:
        print("Usage: python3 generate_donation_pdf.py '<json_data>'", file=sys.stderr)
        sys.exit(1)
