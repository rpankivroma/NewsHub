from typing import Optional, Dict, Any
from jose import jwt, JWTError
from ..config import settings

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes the given JWT access_token using JWT_SECRET and JWT_ALGORITHM.
    Returns the decoded payload dict if valid, else None.
    """
    # Retrieve secret and default to standard fallback if not set
    secret = settings.JWT_SECRET
    algorithm = settings.JWT_ALGORITHM or "HS256"
    
    if not secret:
        # Fallback to backend/auth default key for compatibility
        secret = "super-secret-jwt-key-replace-in-production-123456"
        
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
        return payload
    except JWTError:
        return None
