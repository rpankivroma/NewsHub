from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db, get_main_db
from ..schemas import GuestChatCreate, SupportChatResponse
from ..controllers import SupportChatController
from ..dependencies import get_current_user
from ..models import User, SupportChat, SupportMessage
from ..kafka.producer import publish_chat_created, publish_chat_status_changed
from ..websocket.manager import manager as ws_manager

router = APIRouter(prefix="/support", tags=["support"])
admin_router = APIRouter(prefix="/admin/support", tags=["admin_support"])

@router.get("/chat/{chat_id}/messages")
def get_chat_messages(chat_id: int, db: Session = Depends(get_db)):
    """
    Load message history for a given chat.
    """
    messages = db.query(SupportMessage).filter(SupportMessage.chat_id == chat_id).order_by(SupportMessage.created_at.asc()).all()
    return messages

@router.get("/status")
def get_support_online_status():
    """
    Retrieve whether any support operators are online.
    """
    return {"support_online": len(ws_manager.active_admins) > 0}

@router.patch("/chat/{chat_id}/read")
def mark_chat_as_read(chat_id: int, sender_type: str, db: Session = Depends(get_db)):
    """
    Mark messages in a chat as read depending on whether the reader is visitor (user) or admin (agent).
    """
    if sender_type == "agent":
        db.query(SupportMessage).filter(
            SupportMessage.chat_id == chat_id,
            SupportMessage.sender_type != "agent",
            SupportMessage.is_read == False
        ).update({"is_read": True}, synchronize_session=False)
    else:
        db.query(SupportMessage).filter(
            SupportMessage.chat_id == chat_id,
            SupportMessage.sender_type == "agent",
            SupportMessage.is_read == False
        ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"status": "success"}

@router.post("/guest/chat", response_model=SupportChatResponse, status_code=status.HTTP_201_CREATED)
async def create_guest_support_chat(
    payload: GuestChatCreate,
    db: Session = Depends(get_db),
    main_db: Session = Depends(get_main_db)
):
    """
    Step 11 & Step 13: Create or retrieve active support chat for guest visitor.
    If the email belongs to a blocked registered user, we reject the request.
    """
    user = main_db.query(User).filter(User.email == payload.email).first()
    if user and getattr(user, "status", None) == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked"
        )

    # Check if active chat already exists before executing creation logic
    existing_chat = SupportChatController.get_active_chat_by_email(db, payload.email)

    chat = SupportChatController.create_guest_chat(
        db=db,
        email=payload.email,
        full_name=payload.full_name
    )

    if not existing_chat:
        # A new chat has been created, so we publish chat.created event
        await publish_chat_created(
            chat_id=chat.id,
            user_id=chat.user_id,
            guest_email=chat.guest_email,
            guest_name=chat.guest_name,
            status=chat.status,
            created_at=chat.created_at.isoformat() if chat.created_at else None
        )

    return chat

@router.post("/chat", response_model=SupportChatResponse, status_code=status.HTTP_201_CREATED)
async def create_authenticated_support_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 12 & Step 13: Create or retrieve active support chat for authenticated user.
    """
    existing_chat = SupportChatController.get_active_chat_by_user_id(db, current_user.id)

    chat = SupportChatController.create_authenticated_chat(
        db=db,
        user_id=current_user.id
    )

    if not existing_chat:
        # A new chat has been created, so we publish chat.created event
        await publish_chat_created(
            chat_id=chat.id,
            user_id=chat.user_id,
            guest_email=chat.guest_email,
            guest_name=chat.guest_name,
            status=chat.status,
            created_at=chat.created_at.isoformat() if chat.created_at else None
        )

    return chat


@admin_router.get("/chats")
def get_chats_list(
    page: int = 1,
    search: Optional[str] = None,
    status: Optional[str] = None,
    online: Optional[str] = None,
    registered: Optional[str] = None,
    db: Session = Depends(get_db),
    main_db: Session = Depends(get_main_db)
):
    """
    Step 29, 30, 31, 32: Get list of chats with pagination, search and various filters.
    """
    query = db.query(SupportChat)
    
    # Exclude physically deleted/different formats, soft delete is "deleted"
    if status == "active":
        query = query.filter(SupportChat.status == "active")
    elif status == "inactive":
        query = query.filter(SupportChat.status == "inactive")
    elif status == "deleted":
        query = query.filter(SupportChat.status == "deleted")
    else:
        # Exclude deleted ones by default
        query = query.filter(SupportChat.status != "deleted")
        
    chats = query.order_by(SupportChat.updated_at.desc()).all()
    
    processed_chats = []
    for chat in chats:
        name = "Unknown"
        email = "Unknown"
        is_registered = False
        
        if chat.user_id is not None:
            is_registered = True
            usr = main_db.query(User).filter(User.id == chat.user_id).first()
            if usr:
                name = usr.full_name or "Registered User"
                email = usr.email or ""
        else:
            name = chat.guest_name or "Guest"
            email = chat.guest_email or ""
            
        # Determine online status
        is_online = ws_manager.is_visitor_connected(chat.id)
        
        # Senders other than agent are user/guest messages
        unread_count = db.query(SupportMessage).filter(
            SupportMessage.chat_id == chat.id,
            SupportMessage.is_read == False,
            SupportMessage.sender_type != "agent"
        ).count()
        
        # Last message info
        last_msg_obj = db.query(SupportMessage).filter(
            SupportMessage.chat_id == chat.id
        ).order_by(SupportMessage.created_at.desc()).first()
        last_message = last_msg_obj.content if last_msg_obj else ""
        
        # Filter by online status
        if online is not None:
            target_online = online.lower() in ["online", "true"]
            if is_online != target_online:
                continue
                
        # Filter by registered status
        if registered is not None:
            target_reg = registered.lower() in ["registered", "true"]
            if is_registered != target_reg:
                continue
                
        # Filter by search term
        if search is not None and search.strip():
            sq = search.lower().strip()
            if sq not in name.lower() and sq not in email.lower():
                continue
                
        processed_chats.append({
            "id": chat.id,
            "name": name,
            "email": email,
            "status": chat.status,
            "is_online": is_online,
            "is_registered": is_registered,
            "unread_count": unread_count,
            "last_message": last_message,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at
        })
        
    # Slicing for pagination
    total = len(processed_chats)
    limit = 10
    offset = (page - 1) * limit
    sliced_chats = processed_chats[offset:offset+limit]
    
    return {
        "chats": sliced_chats,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 1
    }


@admin_router.get("/statistics")
def get_support_statistics(
    db: Session = Depends(get_db)
):
    """
    Step 33: Statistics panel content.
    """
    from datetime import datetime, timedelta, timezone
    
    # count of chats where status == "active"
    active_chats = db.query(SupportChat).filter(SupportChat.status == "active").count()
    
    # count of chats created in last 24 hours (not deleted)
    one_day_ago = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=24)
    new_chats = db.query(SupportChat).filter(
        SupportChat.created_at >= one_day_ago,
        SupportChat.status != "deleted"
    ).count()
    
    # total unread messages across all active chats where sender != agent
    unread_messages = db.query(SupportMessage).filter(
        SupportMessage.is_read == False,
        SupportMessage.sender_type != "agent"
    ).count()
    
    # average response time
    chats_to_compute = db.query(SupportChat).filter(SupportChat.status != "deleted").all()
    all_response_times = []
    
    for chat in chats_to_compute:
        messages = db.query(SupportMessage).filter(
            SupportMessage.chat_id == chat.id
        ).order_by(SupportMessage.created_at.asc()).all()
        
        waiting_for_response = False
        user_msg_time = None
        
        for m in messages:
            if m.sender_type != "agent" and not waiting_for_response:
                waiting_for_response = True
                user_msg_time = m.created_at
            elif m.sender_type == "agent" and waiting_for_response and user_msg_time:
                diff = (m.created_at - user_msg_time).total_seconds()
                all_response_times.append(diff)
                waiting_for_response = False
                user_msg_time = None
                
    avg_response_time = (sum(all_response_times) / len(all_response_times)) if all_response_times else 0.0
    
    return {
        "active_chats": active_chats,
        "new_chats": new_chats,
        "unread_messages": unread_messages,
        "avg_response_time": round(avg_response_time, 2)
    }


@admin_router.patch("/chat/{id}/inactive")
async def mark_chat_inactive(id: int, db: Session = Depends(get_db)):
    """
    Step 34: Inactivate support chat.
    """
    chat = db.query(SupportChat).filter(SupportChat.id == id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    old_status = chat.status
    chat.status = "inactive"
    db.commit()
    db.refresh(chat)
    
    # Publish chat.status.changed event
    await publish_chat_status_changed(
        chat_id=chat.id,
        old_status=old_status,
        new_status="inactive",
        updated_at=chat.updated_at.isoformat() if chat.updated_at else None
    )
    
    return {"status": "success", "chat_id": chat.id, "new_status": "inactive"}


@admin_router.delete("/chat/{id}")
async def soft_delete_chat(id: int, db: Session = Depends(get_db)):
    """
    Step 35: Soft delete support chat.
    """
    chat = db.query(SupportChat).filter(SupportChat.id == id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    old_status = chat.status
    chat.status = "deleted"
    db.commit()
    db.refresh(chat)
    
    # Publish chat.status.changed event
    await publish_chat_status_changed(
        chat_id=chat.id,
        old_status=old_status,
        new_status="deleted",
        updated_at=chat.updated_at.isoformat() if chat.updated_at else None
    )
    
    return {"status": "success", "chat_id": chat.id, "new_status": "deleted"}

