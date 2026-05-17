import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()


# -----------------------------
# ENV LOADER (SAFE)
# -----------------------------
def get_clean_env(key, default=None):
    val = os.getenv(key, default)
    if val is None:
        return default
    return val.strip().strip('"').strip("'")


SMTP_HOST = get_clean_env("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(get_clean_env("SMTP_PORT", "587"))

SMTP_USER = get_clean_env("SMTP_USER")
SMTP_PASSWORD = get_clean_env("SMTP_PASSWORD")
SMTP_FROM = get_clean_env("SMTP_FROM")

BASE_URL = get_clean_env("BASE_URL")
if not BASE_URL:
    BASE_URL = "http://localhost:3000"  # fallback (or you can raise error)


# -----------------------------
# SMTP CONNECTION
# -----------------------------
def get_smtp_connection():
    """
    Creates a stable SMTP connection.
    No IP hacks (they break Gmail STARTTLS trust chain).
    """
    print(f"Connecting to SMTP {SMTP_HOST}:{SMTP_PORT}")

    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15)

    # Enable TLS for port 587 (standard)
    if SMTP_PORT != 465:
        server.starttls()

    return server


# -----------------------------
# EMAIL: VERIFICATION
# -----------------------------
def send_verification_email(to_email: str, code: str):
    if not all([SMTP_USER, SMTP_PASSWORD, SMTP_FROM]):
        print("SMTP credentials missing")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = "Verify your NewsHub account"

    plain_text = f"Your verification code is: {code}"

    html_body = f"""
    <html>
      <body style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>NewsHub Verification</h2>
        <p>Your code is:</p>
        <h1 style="letter-spacing: 4px;">{code}</h1>
        <p>This code expires in 10 minutes.</p>
      </body>
    </html>
    """

    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    server = None
    try:
        server = get_smtp_connection()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        return True

    except Exception as e:
        print(f"Verification email error: {e}")
        return False

    finally:
        if server:
            try:
                server.quit()
            except Exception:
                pass


# -----------------------------
# EMAIL: NEWSLETTER
# -----------------------------
def send_newsletter_alert(to_email: str, article_title: str, article_id: int):
    if not all([SMTP_USER, SMTP_PASSWORD, SMTP_FROM]):
        print("SMTP credentials missing")
        return False

    article_url = f"{BASE_URL}/?articleId={article_id}"

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = f"Recommended for you: {article_title}"

    plain_text = f"Read: {article_title} -> {article_url}"

    html_body = f"""
    <html>
      <body style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>NewsHub Recommendation</h2>

        <h3>{article_title}</h3>

        <p>
          <a href="{article_url}">Read full article</a>
        </p>
      </body>
    </html>
    """

    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    server = None
    try:
        server = get_smtp_connection()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        return True

    except Exception as e:
        print(f"Newsletter email error: {e}")
        return False

    finally:
        if server:
            try:
                server.quit()
            except Exception:
                pass