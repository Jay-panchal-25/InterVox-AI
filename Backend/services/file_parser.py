import docx
from pypdf import PdfReader


def parse_txt(file):
    # Read plain text uploads.
    return file.read().decode("utf-8")


def parse_pdf(file):
    # Extract text from each PDF page and join it into one string.
    reader = PdfReader(file)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text


def parse_docx(file):
    # Extract paragraph text from a DOCX document.
    document = docx.Document(file)
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def extract_text(upload_file):
    # Dispatch uploaded files to the correct parser by extension.
    filename = upload_file.filename.lower()

    if filename.endswith(".txt"):
        return parse_txt(upload_file.file)
    if filename.endswith(".pdf"):
        return parse_pdf(upload_file.file)
    if filename.endswith(".docx"):
        return parse_docx(upload_file.file)

    raise ValueError("Unsupported file format")
