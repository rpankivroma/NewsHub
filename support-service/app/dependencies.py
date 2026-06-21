from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_main_db
from .models import User
from .core.security import decode_access_token

security_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_main_db)
) -> User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
        
    sub = payload.get("sub")
    if sub is None:
        raise credentials_exception
        
    # Standard email/id lookup for robust backend session integration
    user = None
    if "@" in str(sub):
        user = db.query(User).filter(User.email == str(sub)).first()
    else:
        try:
            user_id_val = int(sub)
            user = db.query(User).filter(User.id == user_id_val).first()
        except ValueError:
            user = db.query(User).filter(User.email == str(sub)).first()
            
    if user is None:
        raise credentials_exception
        
    # Step 10: Check blocked users (Blocked users cannot create chats, send messages, open chat)
    if getattr(user, "status", None) == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked"
        )
        
    return user
