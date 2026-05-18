import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

# Aggressive stripping of quotes and whitespace
def get_clean_env(key, default=""):
    val = os.getenv(key, default)
    if not val:
        return default
    return val.strip().strip('"').strip("'").strip()

BREVO_API_KEY = get_clean_env("BREVO_API_KEY")
# Fallback for older config if BREVO_API_KEY is not set
if not BREVO_API_KEY:
    BREVO_API_KEY = get_clean_env("SMTP_PASSWORD")

SMTP_FROM = get_clean_env("SMTP_FROM")
BASE_URL = get_clean_env("BASE_URL", "https://news-hub-two-pi.vercel.app")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

def send_brevo_email(to_email: str, subject: str, html_content: str):
    """Generic helper to send email via Brevo API."""
    if not BREVO_API_KEY or not SMTP_FROM:
        print(f"Error: Brevo API credentials missing. API Key: {bool(BREVO_API_KEY)}, From: {SMTP_FROM}")
        return False

    payload = {
        "sender": {"email": SMTP_FROM, "name": "NewsHub"},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    try:
        response = requests.post(BREVO_API_URL, json=payload, headers=headers, timeout=10)
        if response.status_code in [200, 201, 202]:
            return True
        else:
            print(f"Brevo API Error ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"Exception sending Brevo email: {e}")
        return False

def send_verification_email(to_email: str, code: str):
    subject = "Verify your NewsHub account"
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
    return send_brevo_email(to_email, subject, html_body)

def send_newsletter_alert(to_email: str, article_title: str, article_id: int):
    subject = f"Recommended for you: {article_title}"
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
    return send_brevo_email(to_email, subject, html_body)

def check_smtp_status():
    """Diagnostic function to check Brevo API status (kept same name for main.py compatibility)."""
    print(f"🔍 Diagnosing Brevo API Connection...")
    
    if not BREVO_API_KEY:
        return False, "Missing BREVO_API_KEY environment variable."
    
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY
    }
    
    try:
        # Check account info to verify API Key
        response = requests.get("https://api.brevo.com/v3/account", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            email = data.get("email", "unknown")
            return True, f"Brevo API Connection successful. Account: {email}"
        elif response.status_code == 401:
            return False, "Unauthorized: Invalid Brevo API Key."
        else:
            return False, f"Brevo API error: {response.status_code} - {response.text}"
    except Exception as e:
        return False, f"Unexpected error during Brevo check: {str(e)}"
