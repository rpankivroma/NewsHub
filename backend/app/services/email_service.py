import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM")

BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

def send_verification_email(to_email: str, code: str):
    if not all([SMTP_USER, SMTP_PASSWORD, SMTP_FROM]):
        print("Warning: SMTP credentials not set. Code:", code)
        return False
    
    msg = MIMEMultipart('alternative')
    msg['From'] = SMTP_FROM
    msg['To'] = to_email
    msg['Subject'] = "Verify your NewsHub account"
    
    html_body = f"""
    <html>
      <body style="font-family: sans-serif; color: #1a202c; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">NewsHub</h1>
          <p style="color: #718096; margin: 5px 0 0 0;">Independent Journalism Platform</p>
        </div>
        <div style="background-color: #f7fafc; border-radius: 12px; padding: 40px; border: 1px solid #edf2f7; text-align: center;">
          <h2 style="margin-top: 0; color: #2d3748;">Experience the truth.</h2>
          <p style="font-size: 16px; color: #4a5568; margin-bottom: 30px;">Your verification code is below. Please enter it in the application to complete your registration.</p>
          <div style="background-color: #ffffff; border: 2px dashed #cbd5e0; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2d3748;">{code}</span>
          </div>
          <p style="font-size: 14px; color: #a0aec0;">This code will expire in 10 minutes.</p>
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #a0aec0;">
          <p>&copy; 2026 NewsHub. All rights reserved.</p>
        </div>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(html_body, 'html'))
    
    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_FROM, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_newsletter_alert(to_email: str, article_title: str, article_id: int):
    if not all([SMTP_USER, SMTP_PASSWORD, SMTP_FROM]):
        print(f"Warning: SMTP credentials not set. Newsletter alert to {to_email} for: {article_title}")
        return False
    
    msg = MIMEMultipart('alternative')
    msg['From'] = SMTP_FROM
    msg['To'] = to_email
    msg['Subject'] = f"Recommended for you: {article_title}"
    
    article_url = f"{BASE_URL}?articleId={article_id}"
    
    html_body = f"""
    <html>
      <body style="font-family: sans-serif; color: #1a202c; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">NewsHub</h1>
          <p style="color: #718096; margin: 5px 0 0 0;">Personalized News Feed</p>
        </div>
        <div style="background-color: #f0f4ff; border-radius: 12px; padding: 40px; border: 1px solid #e0e7ff; text-align: center;">
          <h2 style="margin-top: 0; color: #1e3a8a;">New article for you!</h2>
          <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">Based on your interests and tags, we think you'll find this story important:</p>
          
          <div style="background-color: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e5e7eb; margin-bottom: 30px; text-align: left;">
            <h3 style="margin-top: 0; color: #111827; font-size: 20px;">{article_title}</h3>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">Discover the latest developments in your feed.</p>
          </div>

          <a href="{article_url}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">
            Read Full Article
          </a>
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #a0aec0;">
          <p>You received this because you are subscribed to NewsHub personal recommendations.</p>
          <p>&copy; 2026 NewsHub. All rights reserved.</p>
        </div>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(html_body, 'html'))
    
    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_FROM, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending newsletter alert: {e}")
        return False
