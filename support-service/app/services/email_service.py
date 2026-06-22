import httpx
import logging
from ..config import settings
from ..database import MainSessionLocal
from ..models import SupportChat, SupportEmailNotification, User
from ..websocket.manager import manager as ws_manager
from datetime import datetime, timezone
from sqlalchemy.orm import Session

logger = logging.getLogger("email_service")

async def verify_brevo_connection() -> bool:
    """
    Verifies the connection to the Brevo API using account endpoint.
    Logs success or failure to the terminal logs.
    """
    api_key = settings.BREVO_API_KEY
    if not api_key:
        logger.error("BREVO_API_KEY is not configured in settings. Brevo connection: FAILED")
        print("BREVO CONNECTION: FAILED - BREVO_API_KEY is not configured in settings.", flush=True)
        return False
        
    url = "https://api.brevo.com/v3/account"
    headers = {
        "api-key": api_key,
        "accept": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=5.0)
            if response.status_code == 200:
                logger.info("BREVO CONNECTION: SUCCESS - Brevo API credentials and connection verified successfully.")
                print("BREVO CONNECTION: SUCCESS - Brevo API credentials and connection verified successfully.", flush=True)
                return True
            else:
                logger.error(f"BREVO CONNECTION: FAILED - Status: {response.status_code}, Response: {response.text}")
                print(f"BREVO CONNECTION: FAILED - Status: {response.status_code}, Response: {response.text}", flush=True)
                return False
    except Exception as e:
        logger.error(f"BREVO CONNECTION: ERROR - Failed to connect to Brevo API: {e}")
        print(f"BREVO CONNECTION: ERROR - Failed to connect to Brevo API: {e}", flush=True)
        return False


async def send_email(recipient_email: str, subject: str, html_content: str) -> bool:
    """
    Sends an email using the Brevo (formerly Sendinblue) v3 API.
    Returns True if sent successfully, False otherwise.
    """
    api_key = settings.BREVO_API_KEY
    if not api_key:
        logger.error("BREVO_API_KEY is not configured in settings.")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "content-type": "application/json",
        "accept": "application/json"
    }
    
    payload = {
        "sender": {"email": "support@newshub.com", "name": "NewsHub Support"},
        "to": [{"email": recipient_email}],
        "subject": subject,
        "htmlContent": html_content
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            if response.status_code in [200, 201, 202, 204]:
                logger.info(f"Email sent successfully to {recipient_email}. Response: {response.text}")
                return True
            else:
                logger.error(f"Failed to send email to {recipient_email}. Status code: {response.status_code}. Response: {response.text}")
                return False
    except Exception as e:
        logger.error(f"Exception occurred while sending email to {recipient_email}: {e}")
        return False


async def check_and_send_offline_notification(db: Session, chat_id: int):
    """
    Step 27 & Step 28: Detect if visitor is offline, check duplicate record, and send email.
    """
    # 1. Detect if visitor websocket connected
    if ws_manager.is_visitor_connected(chat_id):
        logger.info(f"Visitor in chat {chat_id} is online via websocket. Skipping email notification.")
        return

    # 2. Retrieve parent support chat
    chat = db.query(SupportChat).filter(SupportChat.id == chat_id).first()
    if not chat:
        logger.warning(f"Chat {chat_id} not found when checking offline notification.")
        return

    # Find the recipient's email address
    recipient_email = None
    if chat.guest_email:
        recipient_email = chat.guest_email
    elif chat.user_id:
        # Read from main NewsHub database to find the user email
        main_db = MainSessionLocal()
        try:
            user = main_db.query(User).filter(User.id == chat.user_id).first()
            if user:
                recipient_email = user.email
        finally:
            main_db.close()

    if not recipient_email:
        logger.warning(f"Could not resolve recipient email for chat {chat_id}")
        return

    # 3. Check for duplicates in support_email_notifications
    existing = db.query(SupportEmailNotification).filter(
        SupportEmailNotification.chat_id == chat_id,
        SupportEmailNotification.recipient_email == recipient_email,
        SupportEmailNotification.notification_type == "new_message"
    ).first()

    if existing:
        logger.info(f"An existing email notification record already exists for chat_id {chat_id}. Skipping duplicate send.")
        return

    # Create a support email notification record (status pending)
    noti_record = SupportEmailNotification(
        chat_id=chat_id,
        recipient_email=recipient_email,
        notification_type="new_message",
        status="pending"
    )
    db.add(noti_record)
    db.commit()
    db.refresh(noti_record)

    # HTML content for Brevo notification
    subject = f"New Support Message Received - Chat #{chat_id}"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 5px;">
                <h2 style="color: #007bff; margin-top: 0;">You have a new support message</h2>
                <p>Hello,</p>
                <p>An administrator sent a new message regarding your support ticket (ID: <strong>#{chat_id}</strong>).</p>
                <p>Since you are currently offline, we are notifying you via email so you can check and reply as soon as possible.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-style: italic;">"Please visit the support center or log back into your profile to reply."</p>
                </div>
                <p style="font-size: 0.9em; color: #777777;">Thank you for choosing NewsHub.</p>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
                <p style="font-size: 0.8em; color: #999999; text-align: center;">This is an automated security and support message. Please do not reply directly to this email.</p>
            </div>
        </body>
    </html>
    """

    success = await send_email(recipient_email, subject, html_content)
    if success:
        noti_record.status = "sent"
        noti_record.sent_at = datetime.now(timezone.utc).replace(tzinfo=None)
    else:
        noti_record.status = "failed"
        noti_record.error_message = "Brevo API response status failure"
    db.commit()
    logger.info(f"Support email notification completed for chat {chat_id} with status: {noti_record.status}")

