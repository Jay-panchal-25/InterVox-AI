from pypdf import PdfReader
import docx

def parse_txt(file):
    return file.read().decode("utf-8")


def parse_pdf(file):
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def parse_docx(file):
    doc = docx.Document(file)
    return "\n".join([p.text for p in doc.paragraphs])


def extract_text(upload_file):
    filename = upload_file.filename.lower()

    if filename.endswith(".txt"):
        return parse_txt(upload_file.file)

    elif filename.endswith(".pdf"):
        return parse_pdf(upload_file.file)

    elif filename.endswith(".docx"):
        return parse_docx(upload_file.file)

    else:
        raise ValueError("Unsupported file format")