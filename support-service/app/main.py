from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .routers.support import router as support_router, admin_router as support_admin_router
from .kafka.consumer import consumer_manager
from .kafka.producer import producer_manager

import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start Kafka Producer and Consumer background tasks
    await producer_manager.start()
    await consumer_manager.start()
    
    # Check Brevo Connection Status asynchronously on startup
    try:
        from .services.email_service import verify_brevo_connection
        asyncio.create_task(verify_brevo_connection())
    except Exception as e:
        logger = logging.getLogger("main")
        logger.error(f"Failed to initiate Brevo connection check: {e}")

    yield
    # Clean up Kafka tasks
    await consumer_manager.stop()
    await producer_manager.stop()

app = FastAPI(
    title="NewsHub Support Microservice",
    description="Real-time support chat and communication microservice for NewsHub",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"] if settings.FRONTEND_URL else ["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)

# Register routers
app.include_router(support_router)
app.include_router(support_admin_router)

# Import WebSocket & services dependencies
import logging
from fastapi import WebSocket, WebSocketDisconnect
from .database import SessionLocal
from .models import SupportMessage, SupportChat
from .websocket.manager import manager as ws_manager
from .kafka.producer import publish_message_sent
from .services.email_service import check_and_send_offline_notification

logger = logging.getLogger("websocket")

@app.websocket("/ws/support/{chat_id}")
async def visitor_socket(websocket: WebSocket, chat_id: int):
    # Step 25 & Step 22: Connect visitor, tracking online status to true
    await ws_manager.connect_visitor(chat_id, websocket)
    try:
        while True:
            # Wait for message sent by visitor
            data = await websocket.receive_json()
            content = data.get("content")
            if not content:
                continue
                
            # Step 24: Store in DB
            with SessionLocal() as db:
                chat = db.query(SupportChat).filter(SupportChat.id == chat_id).first()
                sender_id = chat.user_id if chat else None
                sender_type = "user"
                
                msg = SupportMessage(
                    chat_id=chat_id,
                    sender_type=sender_type,
                    sender_id=sender_id,
                    content=content,
                    is_read=False
                )
                db.add(msg)
                db.commit()
                db.refresh(msg)
                
                msg_id = msg.id
                created_iso = msg.created_at.isoformat() if msg.created_at else None
                
                # Step 24: Publish to Kafka
                await publish_message_sent(
                    message_id=msg_id,
                    chat_id=chat_id,
                    sender_type=sender_type,
                    sender_id=sender_id,
                    content=content,
                    created_at=created_iso
                )
                
                # Step 24: Push WebSocket event
                event_payload = {
                    "event": "support.message.sent",
                    "data": {
                        "id": msg_id,
                        "chat_id": chat_id,
                        "sender_type": sender_type,
                        "sender_id": sender_id,
                        "content": content,
                        "is_read": False,
                        "created_at": created_iso
                    }
                }
                await ws_manager.send_to_chat(chat_id, event_payload)
                
    except WebSocketDisconnect:
        ws_manager.disconnect_visitor(chat_id, websocket)
    except Exception as e:
        logger.error(f"Error in visitor socket {chat_id}: {e}")
        ws_manager.disconnect_visitor(chat_id, websocket)


@app.websocket("/ws/admin/support")
async def admin_socket(websocket: WebSocket):
    # Step 23 & Step 25: Connect admin socket
    await ws_manager.connect_admin(websocket)
    try:
        while True:
            # Wait for message sent by admin
            data = await websocket.receive_json()
            chat_id = data.get("chat_id")
            content = data.get("content")
            sender_id = data.get("sender_id")
            
            if not chat_id or not content:
                continue
                
            try:
                chat_id = int(chat_id)
            except ValueError:
                continue
                
            # Step 24: Store of Admin Message in DB
            with SessionLocal() as db:
                sender_type = "agent"
                msg = SupportMessage(
                    chat_id=chat_id,
                    sender_type=sender_type,
                    sender_id=sender_id,
                    content=content,
                    is_read=False
                )
                db.add(msg)
                db.commit()
                db.refresh(msg)
                
                msg_id = msg.id
                created_iso = msg.created_at.isoformat() if msg.created_at else None
                
                # Step 24: Publish to Kafka
                await publish_message_sent(
                    message_id=msg_id,
                    chat_id=chat_id,
                    sender_type=sender_type,
                    sender_id=sender_id,
                    content=content,
                    created_at=created_iso
                )
                
                # Step 24: Push WebSocket event
                event_payload = {
                    "event": "support.message.sent",
                    "data": {
                        "id": msg_id,
                        "chat_id": chat_id,
                        "sender_type": sender_type,
                        "sender_id": sender_id,
                        "content": content,
                        "is_read": False,
                        "created_at": created_iso
                    }
                }
                await ws_manager.send_to_chat(chat_id, event_payload)
                
                # Step 27 & Step 28: Trigger email notification if offline visitor is detected
                await check_and_send_offline_notification(db, chat_id)
                
    except WebSocketDisconnect:
        ws_manager.disconnect_admin(websocket)
    except Exception as e:
        logger.error(f"Error in admin socket: {e}")
        ws_manager.disconnect_admin(websocket)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "NewsHub Support Microservice",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "info": "/info"
        }
    }

@app.get("/health")
def health_check():
    # Simple self-health check
    return {
        "status": "healthy",
        "database_configured": bool(settings.DATABASE_URL),
        "kafka_configured": bool(settings.KAFKA_BOOTSTRAP_SERVERS),
        "brevo_configured": bool(settings.BREVO_API_KEY)
    }

@app.get("/info")
def service_info():
    return {
        "jwt_algorithm": settings.JWT_ALGORITHM,
        "frontend_url": settings.FRONTEND_URL,
        "kafka_servers": settings.KAFKA_BOOTSTRAP_SERVERS
    }
