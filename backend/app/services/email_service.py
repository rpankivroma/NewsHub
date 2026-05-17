import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import socket
from dotenv import load_dotenv

load_dotenv()

# Aggressive stripping of quotes and whitespace
def get_clean_env(key, default=""):
    val = os.getenv(key, default)
    if not val:
        return default
    # Remove both types of quotes and any leading/trailing whitespace
    return val.strip().strip('"').strip("'").strip()

SMTP_HOST = get_clean_env("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT_RAW = get_clean_env("SMTP_PORT", "587")
SMTP_PORT = int(SMTP_PORT_RAW) if SMTP_PORT_RAW.isdigit() else 587
SMTP_USER = get_clean_env("SMTP_USER")
SMTP_PASSWORD = get_clean_env("SMTP_PASSWORD")
SMTP_FROM = get_clean_env("SMTP_FROM")

BASE_URL = get_clean_env("BASE_URL", "http://localhost:3000")

def get_smtp_connection():
    """Helper to create SMTP connection with explicit IPv4 resolution and fallback."""
    print(f"DEBUG: Connecting to {SMTP_HOST}:{SMTP_PORT} (User: {SMTP_USER})")
    
    # Try different host variations for Gmail if the primary one fails
    hosts = [SMTP_HOST]
    if "gmail.com" in SMTP_HOST:
        hosts.append("smtp.googlemail.com")

    last_error = None
    for host in hosts:
        print(f"DEBUG: Attempting host: {host}")
        try:
            # Force IPv4 resolution to avoid IPv6 "Network unreachable" issues
            try:
                addr_info = socket.getaddrinfo(host, SMTP_PORT, socket.AF_INET, socket.SOCK_STREAM)
                resolved_ips = [info[4][0] for info in addr_info]
                print(f"DEBUG: Resolved {host} to IPv4 addresses: {resolved_ips}")
            except Exception as res_err:
                print(f"DEBUG: DNS Resolution failed for {host}: {res_err}")
                resolved_ips = [host]

            for ip in resolved_ips:
                try:
                    print(f"DEBUG: Connecting to {ip}...")
                    if SMTP_PORT == 465:
                        return smtplib.SMTP_SSL(ip, SMTP_PORT, timeout=15)
                    else:
                        return smtplib.SMTP(ip, SMTP_PORT, timeout=15)
                except Exception as conn_err:
                    print(f"DEBUG: Connection to {ip} failed: {conn_err}")
                    last_error = conn_err
                    continue
        except Exception as e:
            print(f"DEBUG: Strategy for {host} failed: {e}")
            last_error = e
            continue
    
    raise last_error if last_error else Exception("All SMTP connection attempts failed")

def send_verification_email(to_email: str, code: str):
    if not all([SMTP_USER, SMTP_PASSWORD, SMTP_FROM]):
        print(f"Warning: SMTP credentials missing. User: {bool(SMTP_USER)}, From: {bool(SMTP_FROM)}")
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
        server = get_smtp_connection()
        if SMTP_PORT != 465:
            server.starttls(server_hostname=SMTP_HOST)
        
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_FROM, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email (Target: {to_email}): {e}")
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
        server = get_smtp_connection()
        if SMTP_PORT != 465:
            server.starttls(server_hostname=SMTP_HOST)
        
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_FROM, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending newsletter alert (Target: {to_email}): {e}")
        return False
