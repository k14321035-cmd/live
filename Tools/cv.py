from flask import Flask, request, send_file
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph
import os

app = Flask(__name__)

@app.route("/")
def home():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.route("/generate", methods=["POST"])
def generate():

    name = request.form.get("name")
    title = request.form.get("title")
    email = request.form.get("email")
    phone = request.form.get("phone")
    address = request.form.get("address")
    summary = request.form.get("summary")
    skills = request.form.get("skills")
    experience = request.form.get("experience")
    education = request.form.get("education")

    pdf = "generated_cv.pdf"

    styles = getSampleStyleSheet()

    doc = SimpleDocTemplate(pdf)

    story = []

    story.append(Paragraph(f"<font size=22><b>{name}</b></font>", styles["Title"]))
    story.append(Paragraph(title, styles["Heading2"]))

    story.append(Paragraph(email, styles["Normal"]))
    story.append(Paragraph(phone, styles["Normal"]))
    story.append(Paragraph(address, styles["Normal"]))

    story.append(Paragraph("<br/><b>Professional Summary</b>", styles["Heading2"]))
    story.append(Paragraph(summary.replace("\n","<br/>"), styles["Normal"]))

    story.append(Paragraph("<br/><b>Skills</b>", styles["Heading2"]))
    story.append(Paragraph(skills.replace("\n","<br/>"), styles["Normal"]))

    story.append(Paragraph("<br/><b>Experience</b>", styles["Heading2"]))
    story.append(Paragraph(experience.replace("\n","<br/>"), styles["Normal"]))

    story.append(Paragraph("<br/><b>Education</b>", styles["Heading2"]))
    story.append(Paragraph(education.replace("\n","<br/>"), styles["Normal"]))

    doc.build(story)

    return send_file(pdf, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True)