# ============================================
# 🎬 Codetutorium YouTube-Style PPT Generator
# + AI Voice Narration Generator (10 Minutes)
# ============================================

# INSTALL FIRST:
# pip install python-pptx edge-tts mutagen

import os
import asyncio
import edge_tts

from pptx import Presentation
from pptx.util import Pt
from mutagen.mp3 import MP3

# ============================================
# SLIDE CONTENT (~1500 words = ~10 minutes)
# ============================================

slides_data = [
    {
        "title": "Welcome to Codetutorium.com",
        "text": """
Welcome to Codetutorium dot com.
We are your number one destination for learning programming online.
Our platform is built for students, beginners, and professionals alike.
Whether you are just starting out or looking to sharpen your skills, we have everything you need.
Codetutorium teaches 23 programming languages in one modern, easy-to-use platform.
Our lessons are structured, beginner-friendly, and designed to get you coding fast.
We believe that education should be accessible, practical, and enjoyable for everyone.
Join thousands of students worldwide who are already building their futures with code.
"""
    },

    {
        "title": "What is Programming?",
        "text": """
Programming is the art of writing instructions that tell a computer what to do.
These instructions are written in special languages called programming languages.
Every app you use, every website you visit, and every game you play was built with code.
Programming is the backbone of the entire digital world we live in today.
When you write a program, you are solving a problem step by step in a language the computer understands.
This process requires logical thinking, creativity, and attention to detail.
The good news is that programming is a skill anyone can learn with the right guidance.
It does not require a university degree to get started, just dedication and practice.
"""
    },

    {
        "title": "The History of Computers",
        "text": """
The story of computers began in the 1940s with enormous machines that filled entire rooms.
These early computers, like ENIAC, required teams of engineers just to operate them.
They consumed massive amounts of electricity and were only available to governments and universities.
Over the next few decades, technology advanced at an incredible pace.
The invention of the transistor in 1947 made computers smaller and more reliable.
In the 1970s, personal computers began to emerge, bringing computing to ordinary people.
Apple and IBM played major roles in making computers accessible to homes and businesses.
Today, the smartphone in your pocket is millions of times more powerful than those early machines.
"""
    },

    {
        "title": "Early Programming Challenges",
        "text": """
In the early days of computing, programmers had to write code in binary machine language.
Binary is a system of ones and zeros that directly controls the hardware of a computer.
Writing in binary was incredibly tedious, slow, and prone to errors.
Even a single mistake could crash an entire program and take hours to debug.
Assembly language was developed as the next step to make programming slightly easier.
It used short human-readable codes that mapped directly to machine instructions.
While better than binary, assembly was still very complex and difficult to master.
The need for simpler, more powerful languages became obvious to the entire computing community.
"""
    },

    {
        "title": "The Evolution of Programming Languages",
        "text": """
The 1950s and 1960s saw the creation of the first high-level programming languages.
FORTRAN, created in 1957, was designed for scientific and mathematical computing.
COBOL followed soon after, aimed at business data processing and financial applications.
These languages allowed programmers to write code that was closer to human language.
In the 1970s, the C programming language revolutionized software development with its power and speed.
C became the foundation for operating systems like Unix and later Windows and Linux.
The 1990s brought Java and the internet age, followed by Python and JavaScript.
Today these languages power everything from artificial intelligence to web applications worldwide.
"""
    },

    {
        "title": "Why Learn Programming Today?",
        "text": """
Programming is one of the most in-demand and well-paying skills in the world today.
Companies of all sizes are constantly searching for talented developers to join their teams.
Learning to code is not just about getting a job, it changes the way you think.
Programmers approach problems systematically, breaking them down into smaller manageable steps.
This problem-solving mindset is valuable in every area of life and business.
Beyond careers, coding empowers you to build your own apps, websites, and digital products.
You can turn your ideas into reality without relying on someone else to build them for you.
The demand for software developers is expected to grow significantly over the next decade.
"""
    },

    {
        "title": "Types of Programming Languages",
        "text": """
There are many types of programming languages, each designed for different purposes.
Front-end languages like HTML, CSS, and JavaScript build what users see in their browsers.
Back-end languages like Python, PHP, and Node.js power the servers behind websites and apps.
Mobile development uses languages like Swift for Apple devices and Kotlin for Android.
Systems programming languages like C and C++ are used for operating systems and hardware.
Data science and machine learning rely heavily on Python and R programming.
Database query languages like SQL allow developers to store and retrieve data efficiently.
Understanding which language fits your goal is an important first step in your coding journey.
"""
    },

    {
        "title": "Introducing Codetutorium",
        "text": """
Codetutorium dot com was created with one mission in mind: to make coding education simple and effective.
We understand that learning to program can feel overwhelming without proper guidance and structure.
That is why every course on our platform is carefully designed to take you from beginner to confident developer.
Our lessons combine theory with hands-on practice so you learn by actually writing code.
Each module builds on the previous one, ensuring steady and measurable progress.
Our instructors break down complex concepts into simple, easy-to-understand explanations.
We focus on real-world applications so that every skill you learn has immediate practical value.
Codetutorium is more than a learning platform, it is your coding partner from day one.
"""
    },

    {
        "title": "The 23 Languages We Teach",
        "text": """
Codetutorium offers courses in 23 programming languages covering the full spectrum of development.
We teach web development languages including HTML, CSS, JavaScript, PHP, and TypeScript.
For back-end development we offer Python, Java, Ruby, Go, and Node.js courses.
Mobile app developers can learn Swift, Kotlin, React Native, and Flutter on our platform.
For data science and artificial intelligence we teach Python, R, and Julia.
Systems programmers will find our C, C++, and Rust courses detailed and comprehensive.
Database professionals can master SQL, MongoDB, and Firebase through our structured lessons.
No matter what field of technology you want to enter, Codetutorium has the course for you.
"""
    },

    {
        "title": "How Codetutorium Works",
        "text": """
Getting started on Codetutorium is simple and takes less than two minutes.
Create your free account and gain immediate access to introductory lessons across all languages.
Each course is broken into short, focused lessons designed to fit into your busy schedule.
You can learn at your own pace without any deadlines or pressure to rush through material.
After each lesson you will complete practical exercises that reinforce what you have learned.
Our built-in code editor lets you write and test your code directly inside the browser.
Progress tracking shows you exactly how far you have come and what steps remain ahead.
Certificates of completion are awarded when you finish a course to showcase your new skills.
"""
    },

    {
        "title": "Learning with Real Projects",
        "text": """
At Codetutorium we believe the best way to learn programming is by building real things.
Theory alone is not enough to become a confident and capable developer in today's job market.
Every course includes guided projects that simulate real-world development scenarios.
You will build websites, mobile applications, databases, and automation scripts throughout your learning.
These projects become part of your portfolio, showing employers what you can actually do.
A strong portfolio is often more valuable than a certificate when applying for developer roles.
Our project-based approach ensures you graduate from each course ready to tackle real challenges.
Students who build projects while learning retain knowledge far longer than those who only read theory.
"""
    },

    {
        "title": "Who Can Learn on Codetutorium?",
        "text": """
Codetutorium was designed to serve a wide range of learners from all walks of life.
Complete beginners with no prior experience will find our introductory courses welcoming and clear.
Students in school or university can use our platform to supplement their formal education.
Working professionals looking to switch careers into technology will find structured pathways on our platform.
Freelancers who want to expand their skill set and offer more services to clients will benefit greatly.
Entrepreneurs who want to build their own digital products without hiring developers can learn here too.
Even experienced developers use Codetutorium to pick up new languages and stay current with technology.
No matter your background or experience level, there is a place for you at Codetutorium.
"""
    },

    {
        "title": "The Importance of Consistency",
        "text": """
One of the most important factors in learning to code is consistency.
Practicing for thirty minutes every day will produce far better results than a long session once a week.
Programming is a skill that builds on itself, so regular practice keeps your knowledge fresh and sharp.
Codetutorium is designed to support daily learning with bite-sized lessons you can complete quickly.
Setting a daily coding goal, no matter how small, creates a habit that compounds over time.
Many successful developers credit consistent daily practice as their most important learning strategy.
Our platform sends gentle reminders and tracks your streaks to keep you motivated and on track.
Remember that every expert was once a beginner who simply refused to give up.
"""
    },

    {
        "title": "Career Opportunities in Tech",
        "text": """
The technology industry offers some of the most exciting and rewarding career paths available today.
Software developers, web developers, and data scientists are among the highest paid professionals worldwide.
Companies ranging from small startups to global corporations are constantly hiring talented programmers.
Remote work is incredibly common in technology, giving developers freedom to work from anywhere in the world.
Freelance programming is another popular path that allows complete flexibility over your schedule and income.
Many developers eventually launch their own products or software companies after gaining experience.
The skills you learn on Codetutorium can open doors to careers that did not even exist ten years ago.
Technology is one of the few fields where skills and portfolio often matter more than formal qualifications.
"""
    },

    {
        "title": "Artificial Intelligence and the Future",
        "text": """
Artificial intelligence is transforming every industry at an unprecedented speed.
Developers who understand programming are uniquely positioned to work with and build AI systems.
Machine learning, the technology behind AI, is built primarily using Python and mathematical algorithms.
AI is being used in healthcare, finance, education, transportation, and countless other fields today.
Understanding the basics of programming gives you the foundation to eventually learn machine learning.
Even if you do not specialize in AI, knowing how to use AI tools makes you a more productive developer.
Codetutorium is constantly updating its curriculum to include modern technologies like artificial intelligence.
The future belongs to those who understand and can work alongside intelligent systems and automation.
"""
    },

    {
        "title": "Why Codetutorium Stands Out",
        "text": """
There are many places online where you can learn to code, so why choose Codetutorium?
We combine breadth and depth, offering 23 languages while keeping every lesson high quality and practical.
Our platform is designed with simplicity in mind so you spend your time learning, not navigating menus.
We focus on building real skills that employers and clients actually value in today's market.
Our community of learners supports each other through forums, live sessions, and collaborative projects.
Regular updates ensure our content reflects the latest trends and technologies in software development.
We offer flexible pricing with free access to core lessons so financial barriers do not stop your progress.
Codetutorium is not just a course library, it is a complete ecosystem for your development as a programmer.
"""
    },

    {
        "title": "Getting Started Today",
        "text": """
Starting your programming journey with Codetutorium is completely free and takes only a few minutes.
Visit Codetutorium dot com and create your account to unlock your first set of lessons immediately.
We recommend starting with our Introduction to Programming course if you are a complete beginner.
If you already know the basics, browse our course catalog and choose the language that excites you most.
Set a daily learning goal and commit to showing up consistently, even if just for a short session.
Share your progress with friends or family to stay accountable and celebrate your milestones along the way.
Remember that every line of code you write brings you one step closer to your goals.
Your journey as a developer starts today, and Codetutorium will be with you every step of the way.
"""
    },

    {
        "title": "Conclusion",
        "text": """
Programming is one of the most powerful skills you can develop in the modern world.
It opens doors to incredible careers, creative freedom, and the ability to solve real problems.
The world needs more developers, innovators, and problem solvers who understand technology deeply.
Codetutorium dot com is your partner in becoming the developer you have always wanted to be.
Our platform, our courses, and our community are all here to support your learning journey.
Do not wait for the perfect moment to start because the perfect moment is right now.
Visit Codetutorium dot com today, create your free account, and take the first step toward your future.
Thank you for watching and we look forward to seeing you inside the platform very soon.
"""
    }
]

# ============================================
# CREATE AUDIO FOLDER
# ============================================

if not os.path.exists("audio"):
    os.makedirs("audio")

# ============================================
# GENERATE AI AUDIO
# ============================================

async def generate_audio():
    total_duration = 0
    for i, slide in enumerate(slides_data):
        filename = f"audio/slide_{i+1}.mp3"
        communicate = edge_tts.Communicate(
            slide["text"],
            voice="en-US-AriaNeural"
        )
        await communicate.save(filename)
        print(f"✅ Generated {filename}")

asyncio.run(generate_audio())

# ============================================
# CREATE POWERPOINT
# ============================================

prs = Presentation()
total_duration = 0

for i, slide_data in enumerate(slides_data):

    slide = prs.slides.add_slide(prs.slide_layouts[1])

    # Title
    title = slide.shapes.title
    title.text = slide_data["title"]

    # Content
    body = slide.placeholders[1]
    tf = body.text_frame
    tf.clear()

    lines = [l for l in slide_data["text"].strip().split("\n") if l.strip()]

    for idx, line in enumerate(lines):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.text = line.strip()
        p.font.size = Pt(18)

    # Audio duration info
    audio_file = f"audio/slide_{i+1}.mp3"
    audio = MP3(audio_file)
    duration = round(audio.info.length, 2)
    total_duration += duration

    notes = slide.notes_slide.notes_text_frame
    notes.text = f"Audio Duration: {duration} seconds"

    print(f"🎵 Slide {i+1} — '{slide_data['title']}' — {duration}s")

# ============================================
# SAVE PRESENTATION
# ============================================

ppt_name = "Codetutorium_10Min_Presentation.pptx"
prs.save(ppt_name)

minutes = int(total_duration // 60)
seconds = int(total_duration % 60)

print("\n===================================")
print("🎬 PRESENTATION CREATED SUCCESSFULLY")
print("===================================")
print(f"📂 PPT File  : {ppt_name}")
print(f"📂 Audio     : /audio folder")
print(f"⏱️  Total Time: {minutes} min {seconds} sec ({int(total_duration)}s)")
print(f"📊 Slides    : {len(slides_data)}")
print("===================================")

# ============================================
# MANUAL FINAL STEP IN POWERPOINT
# ============================================

print("""
IMPORTANT FINAL STEP:

PowerPoint Python libraries CANNOT fully embed autoplay audio.

DO THIS MANUALLY:

1. Open the generated PowerPoint file
2. Go to each slide one by one
3. Insert → Audio → Audio on My PC → select matching MP3 from /audio folder
4. In Playback tab:
   - Start: Automatically
   - Check: Hide During Show
   - Check: Rewind after playing
5. In Transitions tab:
   - Set slide advance timing equal to the audio duration in the notes
   - Uncheck: On Mouse Click
   - Check: After (seconds)
6. Add Fade or Morph transitions between slides for a professional look
7. Run Slideshow to verify audio and timing on every slide

DONE 🎬 Your 10-minute YouTube-style presentation is ready!
""")