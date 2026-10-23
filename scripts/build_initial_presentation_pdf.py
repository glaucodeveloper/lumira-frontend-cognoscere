#!/usr/bin/env python3
"""Build the initial Lumira profile and componenting presentation PDF."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/Lumira_Apresentacao_Inicial_Perfil_e_Componentes.pdf"
PROFILE_SCREEN = ROOT / "docs/telas/anotadas/perfil-professor-componentes.png"
COMMUNITY_SCREEN = ROOT / "docs/telas/anotadas/comunidade-componentes.png"
SITE_MAP = ROOT / "docs/telas/10_mapa_do_site.png"
PAGE_W, PAGE_H = landscape(A4)

INK = colors.HexColor("#17324f")
INK_STRONG = colors.HexColor("#102943")
MUTED = colors.HexColor("#71849a")
CANVAS = colors.HexColor("#f4f7fb")
SURFACE = colors.white
LINE = colors.HexColor("#e4eaf1")
BRAND = colors.HexColor("#0b477d")
BRAND_STRONG = colors.HexColor("#082e5c")
TEAL = colors.HexColor("#21a99f")
TEAL_SOFT = colors.HexColor("#e3f6f2")
SUN = colors.HexColor("#f4b64a")

pdfmetrics.registerFont(TTFont("LumiraSans", "/usr/share/fonts/noto/NotoSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("LumiraSansBold", "/usr/share/fonts/noto/NotoSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("LumiraSansItalic", "/usr/share/fonts/noto/NotoSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("LumiraSerif", "/usr/share/fonts/noto/NotoSerif-Regular.ttf"))

STYLES = {
    "body": ParagraphStyle("body", fontName="LumiraSans", fontSize=9.1, leading=14.2, textColor=INK, alignment=TA_LEFT),
    "small": ParagraphStyle("small", fontName="LumiraSans", fontSize=7.2, leading=10.4, textColor=MUTED),
    "card": ParagraphStyle("card", fontName="LumiraSans", fontSize=8.1, leading=12.3, textColor=INK),
    "quote": ParagraphStyle("quote", fontName="LumiraSerif", fontSize=10, leading=15.1, textColor=INK),
    "white": ParagraphStyle("white", fontName="LumiraSans", fontSize=10.3, leading=16.5, textColor=colors.white),
}


def paragraph(canvas: Canvas, text: str, x: float, top: float, width: float, style: str = "body") -> float:
    block = Paragraph(text, STYLES[style])
    _, height = block.wrap(width, PAGE_H)
    block.drawOn(canvas, x, top - height)
    return height


def label(canvas: Canvas, text: str, x: float, y: float, color=MUTED, size=6.5) -> None:
    canvas.setFillColor(color)
    canvas.setFont("LumiraSansBold", size)
    canvas.drawString(x, y, text.upper())


def header(canvas: Canvas, section: str, title: str, subtitle: str, page: int) -> float:
    canvas.setFillColor(CANVAS)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(BRAND)
    canvas.rect(0, PAGE_H - 8, PAGE_W, 8, stroke=0, fill=1)
    label(canvas, "LUMIRA  /  APRESENTAÇÃO INICIAL", 42, PAGE_H - 32, BRAND, 7)
    canvas.setFillColor(TEAL)
    canvas.setFont("LumiraSansBold", 7)
    canvas.drawRightString(PAGE_W - 42, PAGE_H - 32, section.upper())
    canvas.setFillColor(INK_STRONG)
    canvas.setFont("LumiraSansBold", 25)
    canvas.drawString(42, PAGE_H - 77, title)
    paragraph(canvas, subtitle, 42, PAGE_H - 91, PAGE_W - 84, "small")
    canvas.setStrokeColor(LINE)
    canvas.line(42, 34, PAGE_W - 42, 34)
    canvas.setFillColor(MUTED)
    canvas.setFont("LumiraSans", 7)
    canvas.drawString(42, 20, "PROTÓTIPO DE APRESENTAÇÃO · 20 OUT 2026")
    canvas.drawRightString(PAGE_W - 42, 20, f"{page:02d}  /  05")
    return PAGE_H - 125


def card(canvas: Canvas, x: float, y: float, width: float, height: float, fill=SURFACE, radius=10) -> None:
    canvas.setFillColor(fill)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.8)
    canvas.roundRect(x, y, width, height, radius, stroke=1, fill=1)


def image_fit(canvas: Canvas, path: Path, x: float, y: float, width: float, height: float, inset=7) -> tuple[float, float, float, float]:
    image = ImageReader(str(path))
    source_w, source_h = image.getSize()
    available_w, available_h = width - inset * 2, height - inset * 2
    scale = min(available_w / source_w, available_h / source_h)
    draw_w, draw_h = source_w * scale, source_h * scale
    draw_x, draw_y = x + (width - draw_w) / 2, y + (height - draw_h) / 2
    canvas.drawImage(image, draw_x, draw_y, draw_w, draw_h, preserveAspectRatio=True, mask="auto")
    return draw_x, draw_y, draw_w, draw_h


def numbered_note(canvas: Canvas, number: str, title: str, copy: str, x: float, top: float, width: float) -> float:
    canvas.setFillColor(TEAL_SOFT)
    canvas.circle(x + 10, top - 10, 10, stroke=0, fill=1)
    canvas.setFillColor(BRAND)
    canvas.setFont("LumiraSansBold", 7)
    canvas.drawCentredString(x + 10, top - 12.5, number)
    canvas.setFillColor(INK_STRONG)
    canvas.setFont("LumiraSansBold", 9)
    canvas.drawString(x + 28, top - 7, title)
    height = paragraph(canvas, copy, x + 28, top - 16, width - 31, "card")
    return max(42, height + 29)


def page_cover(canvas: Canvas) -> None:
    canvas.setFillColor(BRAND_STRONG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.setFillColor(TEAL)
    canvas.rect(0, 0, 12, PAGE_H, stroke=0, fill=1)
    label(canvas, "LUMIRA  /  APRESENTAÇÃO INICIAL", 48, PAGE_H - 43, colors.HexColor("#b9e8e2"), 7)
    canvas.setFillColor(colors.white)
    canvas.setFont("LumiraSansBold", 33)
    canvas.drawString(48, PAGE_H - 116, "Edição de perfil")
    canvas.drawString(48, PAGE_H - 157, "e partes da plataforma")
    paragraph(canvas, "Um primeiro percurso pela edição funcional de perfil e pela documentação visual do Componenting Demo Lab.", 48, PAGE_H - 181, 345, "white")

    canvas.setFillColor(colors.HexColor("#cce3ee"))
    canvas.setFont("LumiraSans", 9)
    canvas.drawString(48, PAGE_H - 284, "O perfil identifica a pessoa e sua prática. A lista de partes mostra")
    canvas.drawString(48, PAGE_H - 300, "como cada tela se compõe e onde a demonstração deriva da referência.")

    canvas.setFillColor(colors.HexColor("#164e78"))
    canvas.roundRect(48, 88, 360, 102, 12, stroke=0, fill=1)
    label(canvas, "O QUE ESTA APRESENTAÇÃO COBRE", 66, 168, colors.HexColor("#b9e8e2"), 6.4)
    paragraph(canvas, "01 · Edição de nome, função, escola e apresentação<br/>02 · Persistência local no navegador<br/>03 · Leitura das telas e de suas partes<br/>04 · Conexão com o Documento 01 — Filosofia e Visão", 66, 151, 325, "white")

    photo_x, photo_y, photo_w, photo_h = 445, 142, 350, 300
    card(canvas, photo_x, photo_y, photo_w, photo_h, colors.white, 14)
    image_fit(canvas, PROFILE_SCREEN, photo_x + 7, photo_y + 34, photo_w - 14, photo_h - 42, inset=4)
    label(canvas, "PERFIL DOCENTE · TELA DE REFERÊNCIA ANOTADA", photo_x + 16, photo_y + 16, BRAND, 6.2)
    canvas.setFillColor(colors.HexColor("#c9d7e2"))
    canvas.setFont("LumiraSans", 7)
    canvas.drawString(48, 34, "Documento de apresentação para conversa inicial · versão 1.0")
    canvas.drawRightString(PAGE_W - 42, 34, "CONEXÃO COM FORGE: PAT DE CHAT + CHAVE LOCAL DO ROUTER")
    canvas.showPage()


def page_edit(canvas: Canvas) -> None:
    top = header(canvas, "01  /  PERFIL DOCENTE", "Editar perfil: um fluxo concreto", "A ação abre um formulário, aplica os valores à página e confirma o salvamento local.", 2)
    sx, sy, sw, sh = 42, 86, 502, 370
    card(canvas, sx, sy, sw, sh, SURFACE, 12)
    image_fit(canvas, PROFILE_SCREEN, sx + 4, sy + 4, sw - 8, sh - 8, inset=5)
    label(canvas, "CAPTURA ANOTADA DA TELA DE REFERÊNCIA", sx + 12, sy - 16, BRAND, 6)

    right_x, right_w = 572, PAGE_W - 614
    label(canvas, "INTERAÇÃO DEMONSTRADA", right_x, top - 6, TEAL, 6.4)
    cursor = top - 24
    notes = [
        ("Abrir", "O botão <b>Editar perfil</b> fica no hero, junto das ações da identidade.",),
        ("Editar", "Nome, função, escola, frase de apresentação e competências são campos editáveis.",),
        ("Salvar", "O formulário valida campos obrigatórios, atualiza a tela e exibe confirmação.",),
        ("Persistir", "Reabrir ou recarregar a página recupera os valores salvos neste navegador.",),
    ]
    for index, (title, copy) in enumerate(notes, start=1):
        cursor -= numbered_note(canvas, f"0{index}", title, copy, right_x, cursor, right_w)

    card(canvas, right_x, 89, right_w, 65, TEAL_SOFT, 9)
    label(canvas, "PERFIL DO ALUNO", right_x + 13, 136, BRAND, 6)
    paragraph(canvas, "A mesma edição altera a apresentação e os interesses. O texto de “Sobre mim” acompanha o perfil discente.", right_x + 13, 126, right_w - 26, "card")
    canvas.showPage()


def page_screens(canvas: Canvas) -> None:
    top = header(canvas, "02  /  TELAS", "Páginas, recortes e evidência", "As capturas indicam o que veio da referência visual e o que foi proposto para completar a navegação.", 3)
    left_x, left_w, gap = 42, 452, 22
    right_x, right_w = left_x + left_w + gap, PAGE_W - 42 - (left_x + left_w + gap)
    image_h = 260
    card(canvas, left_x, top - image_h, left_w, image_h, SURFACE, 10)
    image_fit(canvas, COMMUNITY_SCREEN, left_x + 4, top - image_h + 4, left_w - 8, image_h - 8, inset=5)
    label(canvas, "COMUNIDADE · REFERÊNCIA ANOTADA", left_x, top - image_h - 15, BRAND, 6)
    paragraph(canvas, "Calendário, abas, tópicos, feed e painel lateral aparecem como partes de página. Os marcadores azuis conectam a captura ao inventário documentado.", left_x, top - image_h - 28, left_w - 4, "small")

    card(canvas, right_x, top - 174, right_w, 174, SURFACE, 10)
    image_fit(canvas, SITE_MAP, right_x + 5, top - 170, right_w - 10, 158, inset=3)
    label(canvas, "MAPA DO SITE · NAVEGAÇÃO DE ORIGEM", right_x, top - 190, BRAND, 6)
    card(canvas, right_x, 101, right_w, 153, TEAL_SOFT, 10)
    label(canvas, "PERFIL ALUNO · PROPOSTA DERIVADA", right_x + 14, 232, BRAND, 6)
    paragraph(canvas, "A documentação declara que a referência disponível é o perfil docente. O perfil discente reaproveita o vocabulário de página e adiciona limites de privacidade: stories e conquistas escolhidos podem circular; respostas e devolutivas pedagógicas ficam reservadas.", right_x + 14, 218, right_w - 28, "card")

    card(canvas, left_x, 82, left_w, 65, SURFACE, 10)
    label(canvas, "LEGENDA DE EVIDÊNCIA", left_x + 14, 128, TEAL, 6)
    paragraph(canvas, "<b>Observada:</b> aparece nas capturas fornecidas. <b>Derivada:</b> inferida para completar a experiência, sem captura direta. A documentação mantém essa diferença visível para quem explora a demo.", left_x + 14, 116, left_w - 28, "card")
    canvas.showPage()


def page_documentation(canvas: Canvas) -> None:
    top = header(canvas, "03  /  DOCUMENTAÇÃO", "A documentação organiza a conversa", "A página de demonstração conecta cada recorte visual a um propósito, a um estado e a dados manipuláveis.", 4)
    left_x, left_w, right_x, right_w = 42, 365, 428, PAGE_W - 470
    card(canvas, left_x, 112, left_w, 326, SURFACE, 10)
    image_fit(canvas, PROFILE_SCREEN, left_x + 5, 145, left_w - 10, 286, inset=5)
    label(canvas, "PRINT DA DOCUMENTAÇÃO · PERFIL", left_x + 13, 128, BRAND, 6)

    card(canvas, right_x, 263, right_w, 175, SURFACE, 10)
    image_fit(canvas, COMMUNITY_SCREEN, right_x + 5, 291, right_w - 10, 138, inset=4)
    label(canvas, "PRINT DA DOCUMENTAÇÃO · COMUNIDADE", right_x + 13, 278, BRAND, 6)

    card(canvas, right_x, 112, right_w, 130, SURFACE, 10)
    label(canvas, "O QUE O LABORATÓRIO PERMITE LER", right_x + 13, 220, TEAL, 6)
    paragraph(canvas, "<b>Partes:</b> navegação lateral, hero, stories, abas e conteúdo.<br/><b>Contexto:</b> a responsabilidade de cada parte acompanha a seleção.<br/><b>Estados:</b> pronto, carregando, vazio, erro e restrito.<br/><b>Propriedades:</b> densidade, destaque e dados próprios da peça.", right_x + 13, 204, right_w - 26, "card")
    canvas.showPage()


def page_philosophy(canvas: Canvas) -> None:
    top = header(canvas, "04  /  FILOSOFIA E VISÃO", "Conexão com o Documento 01", "A interface deve conservar a autoria docente, tornar as intenções legíveis e respeitar o contexto do conhecimento.", 5)
    x, y, w, h = 42, 217, 480, 202
    card(canvas, x, y, w, h, SURFACE, 12)
    label(canvas, "PARÁGRAFO DE CONEXÃO · LEITURA DE PRODUTO", x + 19, y + h - 23, TEAL, 6.2)
    connection = (
        "O Documento 01 parte da especialidade docente: a professora seleciona referências, define a compreensão que quer observar e revisa o material que a IA propõe. A interface traduz essa autoria em campos editáveis e em uma lista que explicita como identidade e prática se dividem pelas partes da página. No perfil discente, stories e publicações podem mostrar produções autorizadas, enquanto respostas de sondagem e devolutivas ficam no acompanhamento reservado. Essa conexão é uma leitura de produto, não uma implementação pedagógica: a demonstração não integra IA, sondagem nem dados escolares."
    )
    paragraph(canvas, connection, x + 19, y + h - 42, w - 38, "quote")

    card(canvas, 546, 217, PAGE_W - 588, 202, BRAND_STRONG, 12)
    label(canvas, "DOCUMENTO 01 · CAPÍTULO 01", 566, 394, colors.HexColor("#b9e8e2"), 6.3)
    paragraph(canvas, "<b>Filosofia e Visão</b><br/>A inteligência generativa como instrumento de ensino", 566, 375, PAGE_W - 628, "white")
    canvas.setStrokeColor(colors.HexColor("#416b8e"))
    canvas.line(566, 326, PAGE_W - 62, 326)
    paragraph(canvas, "O texto fundamenta a centralidade da especialidade docente, a revisão de materiais gerados e a separação entre evidências de aprendizagem e publicações sociais.", 566, 312, PAGE_W - 628, "white")

    card(canvas, 42, 86, PAGE_W - 84, 101, TEAL_SOFT, 10)
    label(canvas, "CONDIÇÕES DE USO DESTA DEMONSTRAÇÃO", 58, 166, BRAND, 6.3)
    paragraph(canvas, "Edição salva no <b>localStorage</b> do navegador atual. A conexão com o Forge local exige o PAT de chat do Cognoscere e a chave local do Port Router; ambos são validados pelo serviço e ficam em memória até recarregar. GitHub Pages e repositório continuam públicos. A edição não sincroniza perfis entre pessoas ou dispositivos.", 58, 150, PAGE_W - 116, "card")
    canvas.showPage()


def main() -> None:
    missing = [path for path in (PROFILE_SCREEN, COMMUNITY_SCREEN, SITE_MAP) if not path.is_file()]
    if missing:
        raise FileNotFoundError("Missing presentation images: " + ", ".join(str(path) for path in missing))
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas = Canvas(str(OUTPUT), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
    canvas.setTitle("Lumira · Apresentação inicial de perfil e componentes")
    canvas.setAuthor("Lumira · apresentação do protótipo")
    canvas.setSubject("Edição de perfil, documentação de partes e conexão com o Documento 01")
    page_cover(canvas)
    page_edit(canvas)
    page_screens(canvas)
    page_documentation(canvas)
    page_philosophy(canvas)
    canvas.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
